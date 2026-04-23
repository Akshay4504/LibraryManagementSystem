using LibraryAPI.Models;

namespace LibraryAPI.Services
{
    public interface IBookManager
    {
        Task<int> AddBook(Book book);
        Task<int> UpdateBook(int id, Book book);
        Task<int> DeleteBook(int id);
        Task<List<Book>> GetBooks();
        Task<Book?> FindBookById(int id);
        Task<Book?> FindBookByName(string name);
    }
}