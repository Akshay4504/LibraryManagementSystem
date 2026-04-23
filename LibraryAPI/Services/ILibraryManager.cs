using LibraryAPI.Models;

namespace LibraryAPI.Services
{
    public interface ILibraryManager
    {
        Task<int> AddLibrary(Library library);
        Task<List<Library>> GetLibraries();
        Task<Library?> FindLibraryById(int id);
        Task<Library?> FindLibraryByName(string name);
        Task<int> UpdateLibrary(int id, Library library);
        Task<int> DeleteLibrary(int id);
    }
}