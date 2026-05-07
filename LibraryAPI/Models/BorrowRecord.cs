using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryAPI.Models
{
    public class BorrowRecord
    {
        [Key]
        [Required]
        public int BorrowId { get; set; }

        [Required]
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public string UserEmail { get; set; } = string.Empty;

        [Required]
        public DateTime IssueDate { get; set; }

        [Required]
        public DateTime ReturnDate { get; set; } 

        public DateTime? ActualReturnDate { get; set; }  

        public bool IsReturned { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DueAmount { get; set; } = 0;  
    }
}