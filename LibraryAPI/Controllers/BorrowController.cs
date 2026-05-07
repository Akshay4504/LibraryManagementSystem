using LibraryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BorrowController : ControllerBase
    {
        private readonly IBorrowManager _borrowManager;
        private readonly ILogger<BorrowController> _logger;

        public BorrowController(IBorrowManager borrowManager, ILogger<BorrowController> logger)
        {
            _borrowManager = borrowManager;
            _logger = logger;
        }

        [HttpPost("{bookId}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> BorrowBook(int bookId)
        {
            try
            {
                if (bookId <= 0)
                    return BadRequest(new { message = "Invalid book ID." });

                var userEmail = User.FindFirstValue(ClaimTypes.Email)
                                ?? User.FindFirstValue(ClaimTypes.Name);

                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized(new { message = "Could not identify user from token." });

                var (status, message) = await _borrowManager.BorrowBook(bookId, userEmail, userEmail);
                if (status == 0) return BadRequest(new { message });
                return Ok(new { message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error borrowing book ID: {BookId}", bookId);
                return StatusCode(500, new { message = "Failed to borrow book." });
            }
        }

        [HttpPost("return/{borrowId}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> ReturnBook(int borrowId)
        {
            try
            {
                if (borrowId <= 0)
                    return BadRequest(new { message = "Invalid borrow ID." });

                var userEmail = User.FindFirstValue(ClaimTypes.Email)
                                ?? User.FindFirstValue(ClaimTypes.Name);

                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized(new { message = "Could not identify user from token." });

                var (status, message, due) = await _borrowManager.ReturnBook(borrowId, userEmail);
                if (status == 0) return BadRequest(new { message });
                return Ok(new { message, dueAmount = due });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error returning borrow ID: {BorrowId}", borrowId);
                return StatusCode(500, new { message = "Failed to return book." });
            }
        }

        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyBorrows()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Email)
                                ?? User.FindFirstValue(ClaimTypes.Name);

                if (string.IsNullOrEmpty(userEmail))
                    return Unauthorized(new { message = "Could not identify user from token." });

                var records = await _borrowManager.GetMyBorrows(userEmail);
                return Ok(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting borrows for user.");
                return StatusCode(500, new { message = "Failed to retrieve borrow records." });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBorrows()
        {
            try
            {
                var records = await _borrowManager.GetAllBorrows();
                return Ok(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all borrow records.");
                return StatusCode(500, new { message = "Failed to retrieve borrow records." });
            }
        }
    }
}