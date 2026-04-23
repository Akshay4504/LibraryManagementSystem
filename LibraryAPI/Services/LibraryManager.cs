using LibraryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryAPI.Services
{
    public class LibraryManager : ILibraryManager
    {
        private readonly LibraryDbContext _context;

        public LibraryManager(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddLibrary(Library library)
        {
            _context.Libraries.Add(library);
            return await _context.SaveChangesAsync();
        }

        public async Task<List<Library>> GetLibraries()
        {
            return await _context.Libraries.Include(l => l.Books).ToListAsync();
        }

        public async Task<Library?> FindLibraryById(int id)
        {
            return await _context.Libraries.Include(l => l.Books)
                .FirstOrDefaultAsync(l => l.LibraryId == id);
        }

        public async Task<Library?> FindLibraryByName(string name)
        {
            return await _context.Libraries.Include(l => l.Books)
                .FirstOrDefaultAsync(l => l.Name.ToLower() == name.ToLower());
        }

        public async Task<int> UpdateLibrary(int id, Library library)
        {
            var existing = await _context.Libraries.FindAsync(id);
            if (existing == null) return 0;

            existing.Name = library.Name;
            existing.Address = library.Address;
            existing.MaximumCapacity = library.MaximumCapacity;

            return await _context.SaveChangesAsync();
        }

        public async Task<int> DeleteLibrary(int id)
        {
            var library = await _context.Libraries.FindAsync(id);
            if (library == null) return 0;

            _context.Libraries.Remove(library);
            return await _context.SaveChangesAsync();
        }
    }
}