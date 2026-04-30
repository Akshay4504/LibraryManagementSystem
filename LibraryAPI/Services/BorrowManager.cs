using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class BorrowManager : IBorrowManager
    {
        private readonly LibraryDbContext _context;

        public BorrowManager(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message)> BorrowBook(int bookId, string userId, string userEmail)
        {
            // Check user hasn't exceeded borrow limit of 3
            var activeBorrows = await _context.BorrowedBooks
                .CountAsync(bb => bb.UserId == userId && !bb.IsReturned);

            if (activeBorrows >= 3)
                return (false, "You cannot borrow more than 3 books at a time.");

            // Check book exists and has copies available
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
                return (false, "Book not found.");

            if (book.AvailableCopies <= 0)
                return (false, "No copies available for this book.");

            // Check user hasn't already borrowed this book
            var alreadyBorrowed = await _context.BorrowedBooks
                .AnyAsync(bb => bb.BookId == bookId && bb.UserId == userId && !bb.IsReturned);

            if (alreadyBorrowed)
                return (false, "You have already borrowed this book.");

            // Borrow the book
            book.AvailableCopies--;

            var borrowedBook = new BorrowedBook
            {
                BookId = bookId,
                UserId = userId,
                UserEmail = userEmail,
                BorrowedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                IsReturned = false
            };

            _context.BorrowedBooks.Add(borrowedBook);
            await _context.SaveChangesAsync();

            return (true, $"Book borrowed successfully. Due date: {borrowedBook.DueDate:dd MMM yyyy}");
        }

        public async Task<(bool Success, string Message)> ReturnBook(int borrowId, string userId)
        {
            var borrowedBook = await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .FirstOrDefaultAsync(bb => bb.BorrowId == borrowId && bb.UserId == userId);

            if (borrowedBook == null)
                return (false, "Borrow record not found.");

            if (borrowedBook.IsReturned)
                return (false, "This book has already been returned.");

            // Return the book
            borrowedBook.IsReturned = true;
            borrowedBook.ReturnedDate = DateTime.UtcNow;
            borrowedBook.Book!.AvailableCopies++;

            await _context.SaveChangesAsync();

            return (true, "Book returned successfully.");
        }

        public async Task<List<BorrowedBook>> GetUserBorrowedBooks(string userId)
        {
            return await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .ThenInclude(b => b!.Library)
                .Where(bb => bb.UserId == userId)
                .OrderByDescending(bb => bb.BorrowedDate)
                .ToListAsync();
        }

        public async Task<List<BorrowedBook>> GetAllBorrowedBooks()
        {
            return await _context.BorrowedBooks
                .Include(bb => bb.Book)
                .ThenInclude(b => b!.Library)
                .OrderByDescending(bb => bb.BorrowedDate)
                .ToListAsync();
        }

    }
}
