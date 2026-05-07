using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class BorrowManager : IBorrowManager
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<BorrowManager> _logger;
        private const decimal FinePerDay = 1.00m;
        private const int BorrowDays = 14;

        public BorrowManager(LibraryDbContext context, ILogger<BorrowManager> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(int, string)> BorrowBook(int bookId, string userId, string userEmail)
        {
            try
            {
                // Check book exists
                var book = await _context.Books.FindAsync(bookId);
                if (book == null)
                    return (0, "Book not found.");

                // Check book is not already borrowed
                var alreadyBorrowed = await _context.BorrowRecords
                    .AnyAsync(br => br.BookId == bookId && !br.IsReturned);
                if (alreadyBorrowed)
                    return (0, "This book is already borrowed by someone else.");

                // Check user has no overdue books
                var hasOverdue = await _context.BorrowRecords
                    .AnyAsync(br => br.UserId == userId && !br.IsReturned
                        && br.ReturnDate < DateTime.UtcNow);
                if (hasOverdue)
                    return (0, "You have overdue books. Please return them before borrowing new ones.");

                var record = new BorrowRecord
                {
                    BookId = bookId,
                    UserId = userId,
                    UserEmail = userEmail,
                    IssueDate = DateTime.UtcNow,
                    ReturnDate = DateTime.UtcNow.AddDays(BorrowDays),
                    IsReturned = false,
                    DueAmount = 0
                };

                _context.BorrowRecords.Add(record);
                await _context.SaveChangesAsync();

                return (1, $"Book borrowed successfully! Return by {record.ReturnDate:dd MMM yyyy}.");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error borrowing book ID: {BookId}", bookId);
                return (0, "Failed to borrow book due to a database error.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error borrowing book ID: {BookId}", bookId);
                return (0, "An unexpected error occurred. Please try again.");
            }
        }

        public async Task<(int, string, decimal)> ReturnBook(int borrowId, string userId)
        {
            try
            {
                var record = await _context.BorrowRecords
                    .Include(br => br.Book)
                    .FirstOrDefaultAsync(br => br.BorrowId == borrowId);

                if (record == null)
                    return (0, "Borrow record not found.", 0);

                if (record.UserId != userId)
                    return (0, "You can only return your own borrowed books.", 0);

                if (record.IsReturned)
                    return (0, "This book has already been returned.", 0);

                var actualReturn = DateTime.UtcNow;
                decimal due = 0;

                // Calculate fine if overdue
                if (actualReturn > record.ReturnDate)
                {
                    var daysOverdue = (int)(actualReturn - record.ReturnDate).TotalDays;
                    due = daysOverdue * FinePerDay;
                }

                record.ActualReturnDate = actualReturn;
                record.IsReturned = true;
                record.DueAmount = due;

                await _context.SaveChangesAsync();

                var msg = due > 0
                    ? $"Book returned. You have a due of ${due:F2} for {(int)(actualReturn - record.ReturnDate).TotalDays} day(s) overdue."
                    : "Book returned successfully. No dues!";

                return (1, msg, due);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error returning borrow ID: {BorrowId}", borrowId);
                return (0, "Failed to process return due to a database error.", 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error returning borrow ID: {BorrowId}", borrowId);
                return (0, "An unexpected error occurred. Please try again.", 0);
            }
        }

        public async Task<List<BorrowRecord>> GetMyBorrows(string userId)
        {
            try
            {
                return await _context.BorrowRecords
                    .Include(br => br.Book)
                    .ThenInclude(b => b!.Library)
                    .Where(br => br.UserId == userId)
                    .OrderByDescending(br => br.IssueDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting borrows for user: {UserId}", userId);
                throw new InvalidOperationException("Failed to retrieve your borrow records.");
            }
        }

        public async Task<List<BorrowRecord>> GetAllBorrows()
        {
            try
            {
                return await _context.BorrowRecords
                    .Include(br => br.Book)
                    .ThenInclude(b => b!.Library)
                    .OrderByDescending(br => br.IssueDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all borrow records.");
                throw new InvalidOperationException("Failed to retrieve borrow records.");
            }
        }
    }
}