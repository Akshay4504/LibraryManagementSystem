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

        public LibraryController(ILibraryManager libraryManager)
        {
            _libraryManager = libraryManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var libraries = await _libraryManager.GetLibraries();
            return Ok(libraries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var library = await _libraryManager.FindLibraryById(id);
            if (library == null) return NotFound($"Library with ID {id} not found.");
            return Ok(library);
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var library = await _libraryManager.FindLibraryByName(name);
            if (library == null) return NotFound($"Library '{name}' not found.");
            return Ok(library);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Library library)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _libraryManager.AddLibrary(library);
            if (result > 0) return CreatedAtAction(nameof(GetById), new { id = library.LibraryId }, library);
            return StatusCode(500, "Failed to create library.");
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Library library)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _libraryManager.UpdateLibrary(id, library);
            if (result == 0) return NotFound($"Library with ID {id} not found.");
            return Ok("Library updated successfully.");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _libraryManager.DeleteLibrary(id);
            if (result == 0) return NotFound($"Library with ID {id} not found.");
            return Ok("Library deleted successfully.");
        }
    }
}