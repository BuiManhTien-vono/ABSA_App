// Controllers/UserController.cs - Admin User Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Auth;
using HigenAbsa.Api.Services.Auth;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize(Roles = "ADMIN")]
public class UserController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of all system users (Admin only).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<UserListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? role = null,
        [FromQuery] string? search = null)
    {
        var result = await authService.GetUsersAsync(page, pageSize, role, search);
        return Ok(result);
    }

    /// <summary>
    /// Get user details by ID (Admin only).
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await authService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { detail = "User not found." });
        return Ok(user);
    }

    /// <summary>
    /// Create a new user account with specified role (Admin only).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = await authService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    /// <summary>
    /// Update user info, role, or active status (Admin only).
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await authService.UpdateUserAsync(id, request);
        if (user == null) return NotFound(new { detail = "User not found." });
        return Ok(user);
    }

    /// <summary>
    /// Deactivate a user account - soft delete (Admin only).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var success = await authService.DeleteUserAsync(id);
        if (!success) return NotFound(new { detail = "User not found." });
        return Ok(new { message = "User deactivated successfully." });
    }
}
