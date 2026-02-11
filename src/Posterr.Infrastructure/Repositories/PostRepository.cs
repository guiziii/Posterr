using Microsoft.EntityFrameworkCore;
using Posterr.Core.Entities;
using Posterr.Core.Interfaces;
using Posterr.Infrastructure.Data;

namespace Posterr.Infrastructure.Repositories;

public class PostRepository(AppDbContext context) : IPostRepository
{
    private readonly AppDbContext _context = context;

    public async Task<(List<Post> Posts, bool HasMore)> GetPostsAsync(int page, int limit, string sort, string? search)
    {
        IQueryable<Post> query = _context.Posts
            .Include(p => p.Author)
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Author)
            .Include(p => p.Reposts);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.OriginalPostId == null && p.Content == search);
        }

        query = sort == "trending"
            ? query.OrderByDescending(p => p.Reposts.Count).ThenByDescending(p => p.CreatedAt)
            : query.OrderByDescending(p => p.CreatedAt);

        var totalAfterFilter = await query.CountAsync();

        var skip = (page - 1) * limit;

        var posts = await query
            .Skip(skip)
            .Take(limit)
            .ToListAsync();

        var hasMore = skip + posts.Count < totalAfterFilter;

        return (posts, hasMore);
    }

    public async Task<Post?> GetByIdAsync(Guid id)
    {
        return await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Author)
            .Include(p => p.Reposts)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Post> CreateAsync(Post post)
    {
        _context.Posts.Add(post);

        await _context.SaveChangesAsync();

        return post;
    }

    public async Task<int> GetUserPostCountTodayAsync(Guid userId)
    {
        var todayUtc = DateTime.UtcNow.Date;
        
        return await _context.Posts
            .CountAsync(p => p.AuthorId == userId && p.CreatedAt >= todayUtc);
    }

    public async Task<bool> HasUserRepostedAsync(Guid userId, Guid originalPostId)
    {
        return await _context.Posts
            .AnyAsync(p => p.AuthorId == userId && p.OriginalPostId == originalPostId);
    }
}
