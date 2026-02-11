using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Posterr.Core.DTOs;
using Posterr.Core.Interfaces;

namespace Posterr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController(IPostService postService) : ControllerBase
{
    private readonly IPostService _postService = postService;

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<PostDto>>> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 15,
        [FromQuery] string sort = "latest",
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;

        if (limit < 1) limit = 15;
        
        if (limit > 100) limit = 100;

        var allowedSortValues = new[] { "latest", "trending" };

        if (!allowedSortValues.Contains(sort, StringComparer.OrdinalIgnoreCase))
            sort = "latest";

        if (search is not null)
        {
            search = search.Trim();

            if (search.Length > 200) search = search[..200];
            
            if (string.IsNullOrWhiteSpace(search)) search = null;
        }

        var result = await _postService.GetPostsAsync(page, limit, sort, search);

        return Ok(result);
    }

    [HttpPost]
    [EnableRateLimiting("post_create")]
    public async Task<ActionResult<PostDto>> CreatePost([FromBody] CreatePostRequest request, [FromHeader(Name = "X-User-ID")][Required] Guid userId)
    {
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
    [EnableRateLimiting("post_create")]
    public async Task<ActionResult<PostDto>> Repost(Guid id, [FromHeader(Name = "X-User-ID")][Required] Guid userId)
    {
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
