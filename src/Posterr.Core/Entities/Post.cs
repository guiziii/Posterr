using System.ComponentModel.DataAnnotations;

namespace Posterr.Core.Entities;

public class Post
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Post content is required.")]
    [StringLength(777, MinimumLength = 1, ErrorMessage = "Post content must be between 1 and 777 characters.")]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid AuthorId { get; set; }

    public User Author { get; set; } = null!;

    public Guid? OriginalPostId { get; set; }
    
    public Post? OriginalPost { get; set; }

    public ICollection<Post> Reposts { get; set; } = [];

    public bool IsRepost => OriginalPostId.HasValue;
}
