using LibraryAPI.Models;

namespace LibraryAPI.Services
{
    public interface IBorrowManager
    {
        Task<(int, string)> BorrowBook(int bookId, string userId, string userEmail);
        Task<(int, string, decimal)> ReturnBook(int borrowId, string userId);
        Task<List<BorrowRecord>> GetMyBorrows(string userId);
        Task<List<BorrowRecord>> GetAllBorrows();
    }
}