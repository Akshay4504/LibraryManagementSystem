using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class LibraryManager : ILibraryManager
    {
        private readonly LibraryDbContext _context;
        private readonly ILogger<LibraryManager> _logger;

        public LibraryManager(LibraryDbContext context, ILogger<LibraryManager> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<int> AddLibrary(Library library)
        {
            try
            {
                _context.Libraries.Add(library);
                return await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error adding library: {Name}", library.Name);
                throw new InvalidOperationException("Failed to add library. Please check your data.");
            }
        }

        public async Task<List<Library>> GetLibraries()
        {
            try
            {
                return await _context.Libraries.Include(l => l.Books).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving libraries.");
                throw new InvalidOperationException("Failed to retrieve libraries.");
            }
        }

        public async Task<Library?> FindLibraryById(int id)
        {
            try
            {
                return await _context.Libraries.Include(l => l.Books)
                    .FirstOrDefaultAsync(l => l.LibraryId == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding library by ID: {Id}", id);
                throw new InvalidOperationException($"Failed to find library with ID {id}.");
            }
        }

        public async Task<Library?> FindLibraryByName(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Library name cannot be empty.");

                return await _context.Libraries.Include(l => l.Books)
                    .FirstOrDefaultAsync(l => l.Name.ToLower() == name.ToLower());
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding library by name: {Name}", name);
                throw new InvalidOperationException($"Failed to find library '{name}'.");
            }
        }

        public async Task<int> UpdateLibrary(int id, Library library)
        {
            try
            {
                var existing = await _context.Libraries.FindAsync(id);
                if (existing == null)
                    throw new KeyNotFoundException($"Library with ID {id} not found.");

                existing.Name = library.Name;
                existing.Address = library.Address;
                existing.MaximumCapacity = library.MaximumCapacity;

                return await _context.SaveChangesAsync();
            }
            catch (KeyNotFoundException) { throw; }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error updating library ID: {Id}", id);
                throw new InvalidOperationException("Failed to update library.");
            }
        }

        public async Task<int> DeleteLibrary(int id)
        {
            try
            {
                var library = await _context.Libraries.FindAsync(id);
                if (library == null)
                    throw new KeyNotFoundException($"Library with ID {id} not found.");

                _context.Libraries.Remove(library);
                return await _context.SaveChangesAsync();
            }
            catch (KeyNotFoundException) { throw; }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error deleting library ID: {Id}", id);
                throw new InvalidOperationException("Failed to delete library.");
            }
        }
    }
}