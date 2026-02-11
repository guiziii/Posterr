using Posterr.Core.DTOs;

namespace Posterr.Core.Interfaces;

public interface IPostService
{
    Task<PaginatedResponse<PostDto>> GetPostsAsync(int page, int limit, string sort, string? search);
    Task<PostDto> CreatePostAsync(Guid userId, string content);
    Task<PostDto> RepostAsync(Guid userId, Guid postId);
}
