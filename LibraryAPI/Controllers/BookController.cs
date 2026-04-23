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

        public BookController(IBookManager bookManager)
        {
            _bookManager = bookManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var books = await _bookManager.GetBooks();
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookManager.FindBookById(id);
            if (book == null) return NotFound($"Book with ID {id} not found.");
            return Ok(book);
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var book = await _bookManager.FindBookByName(name);
            if (book == null) return NotFound($"Book '{name}' not found.");
            return Ok(book);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Book book)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _bookManager.AddBook(book);
            if (result > 0) return CreatedAtAction(nameof(GetById), new { id = book.BookId }, book);
            return StatusCode(500, "Failed to create book.");
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Book book)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _bookManager.UpdateBook(id, book);
            if (result == 0) return NotFound($"Book with ID {id} not found.");
            return Ok("Book updated successfully.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookManager.DeleteBook(id);
            if (result == 0) return NotFound($"Book with ID {id} not found.");
            return Ok("Book deleted successfully.");
        }
    }
}