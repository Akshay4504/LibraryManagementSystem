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
            return Ok(books);
        }

        // Admin sees all borrowed books
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBorrowedBooks()
        {
            var books = await _borrowManager.GetAllBorrowedBooks();
            return Ok(books);
        }
    }
}
