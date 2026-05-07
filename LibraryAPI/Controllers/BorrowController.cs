using LibraryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class BorrowController : ControllerBase
    {
        private readonly IBorrowManager _borrowManager;
        public BorrowController(IBorrowManager borrowManager)
        {
            _borrowManager = borrowManager;
        }

        // User borrows a book
        [HttpPost("{bookId}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> BorrowBook(int bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var userEmail = User.FindFirstValue(ClaimTypes.Email)!;

            var (success, message) = await _borrowManager.BorrowBook(bookId, userId, userEmail);
            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // User returns a book
        [HttpPost("return/{borrowId}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> ReturnBook(int borrowId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var (success, message) = await _borrowManager.ReturnBook(borrowId, userId);
            if (!success) return BadRequest(message);
            return Ok(message);
        }

        // User sees their borrowed books
        [HttpGet("my-books")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyBooks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var books = await _borrowManager.GetUserBorrowedBooks(userId);

            var result = books.Select(b => new
            {
                b.BorrowId,
                b.BookId,
                BookTitle = b.Book?.Title,
                BookAuthor = b.Book?.Author,
                b.BorrowedDate,
                b.DueDate,
                b.ReturnedDate,
                b.IsReturned,
                //b.IsOverdue,
                //b.DaysOverdue,
                //FineAmount = $"${b.FineAmount:F2}"
            });

            return Ok(result);
        }

        /// Check if the current user has any overdue books (quick status check).
        //[HttpGet]
        //[Authorize(Roles = "User")]
        //public async Task<IActionResult> OverdueStatus()
        //{
        //    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        //    var hasOverdue = await _borrowManager.HasOverdueBooks(userId);
        //    var books = await _borrowManager.GetUserBorrowedBooks(userId);

        //    var overdueBooks = books
        //        .Where(b => b.IsOverdue)
        //        .Select(b => new
        //        {
        //            b.BorrowId,
        //            BookTitle = b.Book?.Title,
        //            b.DueDate,
        //            b.DaysOverdue,
        //            FineAmount = $"${b.FineAmount:F2}"
        //        });

        //    return Ok(new
        //    {
        //        HasOverdueBooks = hasOverdue,
        //        OverdueCount = overdueBooks.Count(),
        //        TotalFine = $"${books.Where(b => b.IsOverdue).Sum(b => b.FineAmount):F2}",
        //        OverdueBooks = overdueBooks
        //    });
        //}

        /// [Admin] Get all borrowed books across all users.
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AllBorrowedBooks()
        {
            var books = await _borrowManager.GetAllBorrowedBooks();

            var result = books.Select(b => new
            {
                b.BorrowId,
                b.UserEmail,
                b.BookId,
                BookTitle = b.Book?.Title,
                b.BorrowedDate,
                b.DueDate,
                b.ReturnedDate,
                b.IsReturned,
                //b.IsOverdue,
                //b.DaysOverdue,
                //FineAmount = $"${b.FineAmount:F2}"
            });

            return Ok(result);
        }

        /// [Admin] Get all currently overdue books across all users, ordered by due date ascending.
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> OverdueBooks()
        {
            var books = await _borrowManager.GetAllOverdueBooks();

            var result = books.Select(b => new
            {
                b.BorrowId,
                b.UserEmail,
                BookTitle = b.Book?.Title,
                BookAuthor = b.Book?.Author,
                b.DueDate,
                //b.DaysOverdue,
                //FineAmount = $"${b.FineAmount:F2}"
            });

            return Ok(new
            {
                //TotalOverdue = books.Count,
                //TotalFinesAccrued = $"${books.Sum(b => b.FineAmount):F2}",
                Books = result
            });
        }
    }
}
