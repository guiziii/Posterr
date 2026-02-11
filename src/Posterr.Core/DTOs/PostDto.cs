using System.ComponentModel.DataAnnotations;

namespace Posterr.Core.DTOs;

public record PostDto(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    string AuthorUsername,
    Guid AuthorId,
    bool IsRepost,
    OriginalPostDto? OriginalPost,
    int RepostCount
);

public record OriginalPostDto(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    string AuthorUsername
);

public record CreatePostRequest(
    [Required(ErrorMessage = "Post content is required.")]
    [StringLength(777, MinimumLength = 1, ErrorMessage = "Post content must be between 1 and 777 characters.")]
    string Content
);

public record PaginatedResponse<T>(
    IEnumerable<T> Data,
    int Page,
    int Limit,
    bool HasMore
);
