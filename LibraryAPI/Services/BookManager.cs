using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class BookManager : IBookManager
    {
        private readonly LibraryDbContext _context;

        public BookManager(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddBook(Book book)
        {
            _context.Books.Add(book);
            return await _context.SaveChangesAsync();
        }

        public async Task<int> UpdateBook(int id, Book book)
        {
            var existing = await _context.Books.FindAsync(id);
            if (existing == null) return 0;

            existing.Title = book.Title;
            existing.Author = book.Author;
            existing.Category = book.Category;
            existing.Price = book.Price;
            existing.LibraryId = book.LibraryId;

            return await _context.SaveChangesAsync();
        }

        public async Task<int> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return 0;

            _context.Books.Remove(book);
            return await _context.SaveChangesAsync();
        }

        public async Task<List<Book>> GetBooks()
        {
            return await _context.Books.Include(b => b.Library).ToListAsync();
        }

        public async Task<Book?> FindBookById(int id)
        {
            return await _context.Books.Include(b => b.Library)
                .FirstOrDefaultAsync(b => b.BookId == id);
        }

        public async Task<Book?> FindBookByName(string name)
        {
            return await _context.Books.Include(b => b.Library)
                .FirstOrDefaultAsync(b => b.Title.ToLower() == name.ToLower());
        }
    }
}