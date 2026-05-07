using LibraryAPI.Models;
using LibraryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly ILibraryManager _libraryManager;
        private readonly ILogger<LibraryController> _logger;

        public LibraryController(ILibraryManager libraryManager, ILogger<LibraryController> logger)
        {
            _libraryManager = libraryManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var libraries = await _libraryManager.GetLibraries();
                return Ok(libraries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all libraries.");
                return StatusCode(500, new { message = "Failed to retrieve libraries." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid library ID." });
                var library = await _libraryManager.FindLibraryById(id);
                if (library == null) return NotFound(new { message = $"Library with ID {id} not found." });
                return Ok(library);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting library by ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to retrieve library." });
            }
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return BadRequest(new { message = "Library name cannot be empty." });
                var library = await _libraryManager.FindLibraryByName(name);
                if (library == null) return NotFound(new { message = $"Library '{name}' not found." });
                return Ok(library);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting library by name: {Name}", name);
                return StatusCode(500, new { message = "Failed to retrieve library." });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Library library)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data.", errors = ModelState });
                var result = await _libraryManager.AddLibrary(library);
                if (result > 0)
                    return CreatedAtAction(nameof(GetById), new { id = library.LibraryId }, library);
                return StatusCode(500, new { message = "Failed to create library." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating library.");
                return StatusCode(500, new { message = "Failed to create library." });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Library library)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid library ID." });
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Invalid data.", errors = ModelState });
                var result = await _libraryManager.UpdateLibrary(id, library);
                if (result == 0) return NotFound(new { message = $"Library with ID {id} not found." });
                return Ok(new { message = "Library updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating library ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to update library." });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0) return BadRequest(new { message = "Invalid library ID." });
                var result = await _libraryManager.DeleteLibrary(id);
                if (result == 0) return NotFound(new { message = $"Library with ID {id} not found." });
                return Ok(new { message = "Library deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting library ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to delete library." });
            }
        }
    }
}