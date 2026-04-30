using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryAPI.Models
{
    public class Book
    {
        [Key]
        [Required]
        public int BookId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Author { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int LibraryId { get; set; }

        [ForeignKey("LibraryId")]
        public Library? Library { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Total Copies must be between 1 and 5")]
        public int TotalCopies { get; set; } = 1;

        [Required]
        public int AvailableCopies { get; set; } = 1;

        public ICollection<BorrowedBook>? BorrowedBooks { get; set; }
    }
}
