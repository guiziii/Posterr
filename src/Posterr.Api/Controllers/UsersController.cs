using Microsoft.AspNetCore.Mvc;
using Posterr.Core.Interfaces;

namespace Posterr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserRepository userRepository) : ControllerBase
{
    private readonly IUserRepository _userRepository = userRepository;

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] int limit = 50)
    {
        if (limit < 1) limit = 50;
        
        if (limit > 100) limit = 100;

        var users = await _userRepository.GetAllAsync();

        var result = users.Take(limit).Select(u => new
        {
            u.Id,
            u.Username,
            u.CreatedAt
        });

        return Ok(result);
    }
}
