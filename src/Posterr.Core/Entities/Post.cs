namespace Posterr.Core.Entities;

public class Post
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public Guid? OriginalPostId { get; set; }
    public Post? OriginalPost { get; set; }

    public ICollection<Post> Reposts { get; set; } = new List<Post>();

    public bool IsRepost => OriginalPostId.HasValue;
}
