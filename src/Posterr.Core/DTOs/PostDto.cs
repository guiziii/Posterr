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

public record CreatePostRequest(string Content);

public record PaginatedResponse<T>(
    IEnumerable<T> Data,
    int Page,
    int Limit,
    bool HasMore
);
