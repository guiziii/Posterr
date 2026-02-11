using Microsoft.AspNetCore.Mvc;
using Posterr.Core.DTOs;
using Posterr.Core.Interfaces;

namespace Posterr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<PostDto>>> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 15,
        [FromQuery] string sort = "latest",
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 15;

        var result = await _postService.GetPostsAsync(page, limit, sort, search);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(
        [FromBody] CreatePostRequest request,
        [FromHeader(Name = "X-User-ID")] Guid userId)
    {
        if (userId == Guid.Empty)
            return BadRequest(new { error = "X-User-ID header is required." });

        try
        {
            var post = await _postService.CreatePostAsync(userId, request.Content);
            return CreatedAtAction(nameof(GetPosts), post);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/repost")]
    public async Task<ActionResult<PostDto>> Repost(
        Guid id,
        [FromHeader(Name = "X-User-ID")] Guid userId)
    {
        if (userId == Guid.Empty)
            return BadRequest(new { error = "X-User-ID header is required." });

        try
        {
            var repost = await _postService.RepostAsync(userId, id);
            return CreatedAtAction(nameof(GetPosts), repost);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
