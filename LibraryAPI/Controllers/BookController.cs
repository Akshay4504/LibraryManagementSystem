using LibraryAPI.Models;
using LibraryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookController : ControllerBase
    {
        private readonly IBookManager _bookManager;
        private readonly ILogger<BookController> _logger;

        public BookController(IBookManager bookManager, ILogger<BookController> logger)
        {
            _bookManager = bookManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var books = await _bookManager.GetBooks();
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all books.");
                return StatusCode(500, new { message = "Failed to retrieve books." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid book ID." });
                var book = await _bookManager.FindBookById(id);
                if (book == null) return NotFound(new { message = $"Book with ID {id} not found." });
                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book by ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to retrieve book." });
            }
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return BadRequest(new { message = "Book name cannot be empty." });
                var book = await _bookManager.FindBookByName(name);
                if (book == null) return NotFound(new { message = $"Book '{name}' not found." });
                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book by name: {Name}", name);
                return StatusCode(500, new { message = "Failed to retrieve book." });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Book book)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data.", errors = ModelState });
                var result = await _bookManager.AddBook(book);
                if (result > 0)
                    return CreatedAtAction(nameof(GetById), new { id = book.BookId }, book);
                return StatusCode(500, new { message = "Failed to create book." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book.");
                return StatusCode(500, new { message = "Failed to create book." });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Book book)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid book ID." });
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data.", errors = ModelState });
                var result = await _bookManager.UpdateBook(id, book);
                if (result == 0) return NotFound(new { message = $"Book with ID {id} not found." });
                return Ok(new { message = "Book updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to update book." });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid book ID." });
                var result = await _bookManager.DeleteBook(id);
                if (result == 0) return NotFound(new { message = $"Book with ID {id} not found." });
                return Ok(new { message = "Book deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to delete book." });
            }
        }
    }
}