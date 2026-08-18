// Controllers/AuthController.cs - RESTful Authentication Endpoints
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Auth;
using HigenAbsa.Api.Services.Auth;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// Register a new system user account.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            string ipAddress = GetClientIpAddress();
            var result = await authService.RegisterAsync(request, ipAddress);
            logger.LogInformation("User registered successfully: {Email}", request.Email);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Registration failed for {Email}", request.Email);
            return StatusCode(500, new { detail = "An error occurred during registration." });
        }
    }

    /// <summary>
    /// Authenticate user credentials and return JWT Access Token + Refresh Token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            string ipAddress = GetClientIpAddress();
            var result = await authService.LoginAsync(request, ipAddress);
            logger.LogInformation("User logged in: {Email}", request.Email);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Login failed for {Email}", request.Email);
            return StatusCode(500, new { detail = "An error occurred during login." });
        }
    }

    /// <summary>
    /// Exchange an active Refresh Token for a new Access Token & Refresh Token (Token Rotation).
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            string ipAddress = GetClientIpAddress();
            var result = await authService.RefreshTokenAsync(request.RefreshToken, ipAddress);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Token refresh failed");
            return StatusCode(500, new { detail = "An error occurred during token refresh." });
        }
    }

    /// <summary>
    /// Revoke current Refresh Token (Logout).
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        string ipAddress = GetClientIpAddress();
        await authService.LogoutAsync(request.RefreshToken, ipAddress);
        return Ok(new { message = "Logged out successfully." });
    }

    /// <summary>
    /// Get authenticated user's profile info. Requires Bearer Token.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { detail = "Invalid user claim." });

        var profile = await authService.GetProfileAsync(userId);
        if (profile == null) return NotFound(new { detail = "User not found." });

        return Ok(profile);
    }

    private string GetClientIpAddress()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
            return forwardedFor.FirstOrDefault() ?? "127.0.0.1";

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    }
}
