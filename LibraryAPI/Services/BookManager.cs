using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class BookManager : IBookManager
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<BookManager> _logger;

        public BookManager(LibraryDbContext context, ILogger<BookManager> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<int> AddBook(Book book)
        {
            try
            {
                // Validate library exists
                var libraryExists = await _context.Libraries.AnyAsync(l => l.LibraryId == book.LibraryId);
                if (!libraryExists)
                    throw new KeyNotFoundException($"Library with ID {book.LibraryId} not found.");

                _context.Books.Add(book);
                return await _context.SaveChangesAsync();
            }
            catch (KeyNotFoundException) { throw; }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error adding book: {Title}", book.Title);
                throw new InvalidOperationException("Failed to add book. Please check your data.");
            }
        }

        public async Task<int> UpdateBook(int id, Book book)
        {
            try
            {
                var existing = await _context.Books.FindAsync(id);
                if (existing == null)
                    throw new KeyNotFoundException($"Book with ID {id} not found.");

                existing.Title = book.Title;
                existing.Author = book.Author;
                existing.Category = book.Category;
                existing.Price = book.Price;
                existing.LibraryId = book.LibraryId;

                return await _context.SaveChangesAsync();
            }
            catch (KeyNotFoundException) { throw; }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error updating book ID: {Id}", id);
                throw new InvalidOperationException("Failed to update book.");
            }
        }

        public async Task<int> DeleteBook(int id)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                    throw new KeyNotFoundException($"Book with ID {id} not found.");

                _context.Books.Remove(book);
                return await _context.SaveChangesAsync();
            }
            catch (KeyNotFoundException) { throw; }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error deleting book ID: {Id}", id);
                throw new InvalidOperationException("Failed to delete book.");
            }
        }

        public async Task<List<Book>> GetBooks()
        {
            try
            {
                return await _context.Books.Include(b => b.Library).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving books.");
                throw new InvalidOperationException("Failed to retrieve books.");
            }
        }

        public async Task<Book?> FindBookById(int id)
        {
            try
            {
                return await _context.Books.Include(b => b.Library)
                    .FirstOrDefaultAsync(b => b.BookId == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding book by ID: {Id}", id);
                throw new InvalidOperationException($"Failed to find book with ID {id}.");
            }
        }

        public async Task<Book?> FindBookByName(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Book name cannot be empty.");

                return await _context.Books.Include(b => b.Library)
                    .FirstOrDefaultAsync(b => b.Title.ToLower() == name.ToLower());
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding book by name: {Name}", name);
                throw new InvalidOperationException($"Failed to find book '{name}'.");
            }
        }
    }
}