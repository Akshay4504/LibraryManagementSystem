using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryAPI.Models
{
    public class BorrowedBook
    {
        [Key]
        public int BorrowId { get; set; }

        [Required]
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }

        // UserId from JWT token (no FK to another DB)
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        public DateTime BorrowedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(30);

        public DateTime? ReturnedDate { get; set; }

        public bool IsReturned { get; set; } = false;
    }
}
