using Posterr.Core.Entities;

namespace Posterr.Core.Interfaces;

public interface IPostRepository
{
    Task<(List<Post> Posts, bool HasMore)> GetPostsAsync(int page, int limit, string sort, string? search);
    Task<Post?> GetByIdAsync(Guid id);
    Task<Post> CreateAsync(Post post);
    Task<int> GetUserPostCountTodayAsync(Guid userId);
    Task<bool> HasUserRepostedAsync(Guid userId, Guid originalPostId);
}
