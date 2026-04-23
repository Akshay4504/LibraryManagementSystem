using System.ComponentModel.DataAnnotations;

namespace LibraryAPI.Models
{
    public class Library
    {
        [Key]
        [Required]
        public int LibraryId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public int MaximumCapacity { get; set; }

        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}