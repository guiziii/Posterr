using Moq;
using Posterr.Core.DTOs;
using Posterr.Core.Entities;
using Posterr.Core.Interfaces;
using Posterr.Core.Services;

namespace Posterr.Tests;

public class PostServiceTests
{
    private readonly Mock<IPostRepository> _postRepoMock;
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly PostService _service;
    private readonly User _testUser;

    public PostServiceTests()
    {
        _postRepoMock = new Mock<IPostRepository>();
        _userRepoMock = new Mock<IUserRepository>();
        _service = new PostService(_postRepoMock.Object, _userRepoMock.Object);
        _testUser = new User { Id = Guid.NewGuid(), Username = "alice_johnson" };
    }

    [Fact]
    public async Task CreatePost_ValidContent_ReturnsPost()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetUserPostCountTodayAsync(_testUser.Id)).ReturnsAsync(0);
        _postRepoMock.Setup(r => r.CreateAsync(It.IsAny<Post>()))
            .ReturnsAsync((Post p) => p);

        var result = await _service.CreatePostAsync(_testUser.Id, "Hello, world!");

        Assert.NotNull(result);
        Assert.Equal("Hello, world!", result.Content);
        Assert.Equal("alice_johnson", result.AuthorUsername);
        Assert.False(result.IsRepost);
    }

    [Fact]
    public async Task CreatePost_EmptyContent_ThrowsArgumentException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreatePostAsync(_testUser.Id, "  "));
    }

    [Fact]
    public async Task CreatePost_ExceedsMaxLength_ThrowsArgumentException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);

        var longContent = new string('a', 778);
        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreatePostAsync(_testUser.Id, longContent));
    }

    [Fact]
    public async Task CreatePost_ExceedsDailyLimit_ThrowsInvalidOperation()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetUserPostCountTodayAsync(_testUser.Id)).ReturnsAsync(5);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreatePostAsync(_testUser.Id, "Hello!"));
    }

    [Fact]
    public async Task CreatePost_UserNotFound_ThrowsArgumentException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreatePostAsync(Guid.NewGuid(), "Hello!"));
    }

    [Fact]
    public async Task CreatePost_ExactlyMaxLength_Succeeds()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetUserPostCountTodayAsync(_testUser.Id)).ReturnsAsync(0);
        _postRepoMock.Setup(r => r.CreateAsync(It.IsAny<Post>()))
            .ReturnsAsync((Post p) => p);

        var content = new string('a', 777);
        var result = await _service.CreatePostAsync(_testUser.Id, content);

        Assert.Equal(777, result.Content.Length);
    }

    [Fact]
    public async Task Repost_ValidOriginalPost_ReturnsRepost()
    {
        var otherUser = new User { Id = Guid.NewGuid(), Username = "john_doe" };
        var originalPost = new Post
        {
            Id = Guid.NewGuid(),
            Content = "Original post",
            AuthorId = otherUser.Id,
            Author = otherUser,
            Reposts = new List<Post>()
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(originalPost.Id)).ReturnsAsync(originalPost);
        _postRepoMock.Setup(r => r.HasUserRepostedAsync(_testUser.Id, originalPost.Id)).ReturnsAsync(false);
        _postRepoMock.Setup(r => r.GetUserPostCountTodayAsync(_testUser.Id)).ReturnsAsync(0);
        _postRepoMock.Setup(r => r.CreateAsync(It.IsAny<Post>()))
            .ReturnsAsync((Post p) => p);

        var result = await _service.RepostAsync(_testUser.Id, originalPost.Id);

        Assert.True(result.IsRepost);
        Assert.NotNull(result.OriginalPost);
        Assert.Equal("Original post", result.OriginalPost!.Content);
    }

    [Fact]
    public async Task Repost_RepostOfRepost_ThrowsInvalidOperation()
    {
        var otherUser = new User { Id = Guid.NewGuid(), Username = "john_doe" };
        var repost = new Post
        {
            Id = Guid.NewGuid(),
            Content = "Reposted",
            AuthorId = otherUser.Id,
            Author = otherUser,
            OriginalPostId = Guid.NewGuid(),
            Reposts = new List<Post>()
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(repost.Id)).ReturnsAsync(repost);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RepostAsync(_testUser.Id, repost.Id));
    }

    [Fact]
    public async Task Repost_OwnPost_ThrowsInvalidOperation()
    {
        var ownPost = new Post
        {
            Id = Guid.NewGuid(),
            Content = "My post",
            AuthorId = _testUser.Id,
            Author = _testUser,
            Reposts = []
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(ownPost.Id)).ReturnsAsync(ownPost);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RepostAsync(_testUser.Id, ownPost.Id));
    }

    [Fact]
    public async Task Repost_AlreadyReposted_ThrowsInvalidOperation()
    {
        var otherUser = new User { Id = Guid.NewGuid(), Username = "john_doe" };
        var originalPost = new Post
        {
            Id = Guid.NewGuid(),
            Content = "Original",
            AuthorId = otherUser.Id,
            Author = otherUser,
            Reposts = []
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(originalPost.Id)).ReturnsAsync(originalPost);
        _postRepoMock.Setup(r => r.HasUserRepostedAsync(_testUser.Id, originalPost.Id)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RepostAsync(_testUser.Id, originalPost.Id));
    }

    [Fact]
    public async Task Repost_DailyLimitReached_ThrowsInvalidOperation()
    {
        var otherUser = new User { Id = Guid.NewGuid(), Username = "john_doe" };
        var originalPost = new Post
        {
            Id = Guid.NewGuid(),
            Content = "Original",
            AuthorId = otherUser.Id,
            Author = otherUser,
            Reposts = new List<Post>()
        };

        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(originalPost.Id)).ReturnsAsync(originalPost);
        _postRepoMock.Setup(r => r.HasUserRepostedAsync(_testUser.Id, originalPost.Id)).ReturnsAsync(false);
        _postRepoMock.Setup(r => r.GetUserPostCountTodayAsync(_testUser.Id)).ReturnsAsync(5);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.RepostAsync(_testUser.Id, originalPost.Id));
    }

    [Fact]
    public async Task Repost_PostNotFound_ThrowsArgumentException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(_testUser.Id)).ReturnsAsync(_testUser);
        _postRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Post?)null);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.RepostAsync(_testUser.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetPosts_ReturnsPaginatedResponse()
    {
        var posts = new List<Post>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Content = "Post 1",
                AuthorId = _testUser.Id,
                Author = _testUser,
                Reposts = new List<Post>()
            }
        };

        _postRepoMock.Setup(r => r.GetPostsAsync(1, 15, "latest", null))
            .ReturnsAsync((posts, false));

        var result = await _service.GetPostsAsync(1, 15, "latest", null);

        Assert.Single(result.Data);
        Assert.False(result.HasMore);
        Assert.Equal(1, result.Page);
    }
}
