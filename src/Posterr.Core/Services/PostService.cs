using Posterr.Core.DTOs;
using Posterr.Core.Entities;
using Posterr.Core.Interfaces;

namespace Posterr.Core.Services;

public class PostService(IPostRepository postRepository, IUserRepository userRepository) : IPostService
{
    private const int MaxPostsPerDay = 5;
    
    private const int MaxPostLength = 777;

    private readonly IPostRepository _postRepository = postRepository;
    private readonly IUserRepository _userRepository = userRepository;

    public async Task<PaginatedResponse<PostDto>> GetPostsAsync(int page, int limit, string sort, string? search)
    {
        var (posts, hasMore) = await _postRepository.GetPostsAsync(page, limit, sort, search);

        var dtos = posts.Select(MapToDto).ToList();

        return new PaginatedResponse<PostDto>(dtos, page, limit, hasMore);
    }

    public async Task<PostDto> CreatePostAsync(Guid userId, string content)
    {
        var user = await _userRepository.GetByIdAsync(userId) ?? throw new ArgumentException("User not found.");

        if (string.IsNullOrWhiteSpace(content) || content.Length > MaxPostLength)
            throw new ArgumentException("Post content cannot be empty or exceed 777 characters.");

        var todayCount = await _postRepository.GetUserPostCountTodayAsync(userId);
        
        if (todayCount >= MaxPostsPerDay)
            throw new InvalidOperationException($"You have reached the daily limit of {MaxPostsPerDay} posts.");

        var post = new Post
        {
            Id = Guid.NewGuid(),
            Content = content.Trim(),
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _postRepository.CreateAsync(post);
        
        created.Author = user;

        return MapToDto(created);
    }

    public async Task<PostDto> RepostAsync(Guid userId, Guid postId)
    {
        var user = await _userRepository.GetByIdAsync(userId) ?? throw new ArgumentException("User not found.");

        var originalPost = await _postRepository.GetByIdAsync(postId) ?? throw new ArgumentException("Post not found.");

        if (originalPost.IsRepost)
            throw new InvalidOperationException("Cannot repost a repost.");

        if (originalPost.AuthorId == userId)
            throw new InvalidOperationException("Cannot repost your own post.");

        var alreadyReposted = await _postRepository.HasUserRepostedAsync(userId, postId);

        if (alreadyReposted)
            throw new InvalidOperationException("You have already reposted this post.");

        var todayCount = await _postRepository.GetUserPostCountTodayAsync(userId);

        if (todayCount >= MaxPostsPerDay)
            throw new InvalidOperationException($"You have reached the daily limit of {MaxPostsPerDay} posts.");

        var repost = new Post
        {
            Id = Guid.NewGuid(),
            Content = originalPost.Content,
            AuthorId = userId,
            OriginalPostId = postId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _postRepository.CreateAsync(repost);

        created.Author = user;

        created.OriginalPost = originalPost;

        return MapToDto(created);
    }

    private static PostDto MapToDto(Post post)
    {
        OriginalPostDto? originalPostDto = null;

        if (post.IsRepost && post.OriginalPost is not null)
        {
            originalPostDto = new OriginalPostDto(
                post.OriginalPost.Id,
                post.OriginalPost.Content,
                post.OriginalPost.CreatedAt,
                post.OriginalPost.Author?.Username ?? "Unknown"
            );
        }

        return new PostDto(
            post.Id,
            post.Content,
            post.CreatedAt,
            post.Author?.Username ?? "Unknown",
            post.AuthorId,
            post.IsRepost,
            originalPostDto,
            post.Reposts?.Count ?? 0
        );
    }
}
