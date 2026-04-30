using LibraryAPI.Models;

namespace LibraryAPI.Services
{
    public interface IBorrowManager
    {
        Task<(bool Success, string Message)> BorrowBook(int bookId, string userId, string userEmail);
        Task<(bool Success, string Message)> ReturnBook(int borrowId, string userId);
        Task<List<BorrowedBook>> GetUserBorrowedBooks(string userId);
        Task<List<BorrowedBook>> GetAllBorrowedBooks();
    }
}
