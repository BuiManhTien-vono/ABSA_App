using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/lazada")]
public class LazadaController(
    ILazadaAuthService authService,
    ILazadaApiService apiService,
    IStoreService storeService,
    ILogger<LazadaController> logger) : ControllerBase
{
    [HttpGet("authorize-url")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult GetAuthorizeUrl([FromQuery] string? redirectUri, [FromQuery] string? state)
    {
        var url = authService.GetAuthorizationUrl(redirectUri, state);
        return Ok(new { url });
    }

    [HttpPost("token")]
    [Authorize]
    [ProducesResponseType(typeof(LazadaTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateToken([FromBody] LazadaTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            return BadRequest(new { detail = "Authorization code is required." });

        var tokenResponse = await authService.CreateTokenAsync(request.Code);
        if (tokenResponse.Code != "0" && !string.IsNullOrEmpty(tokenResponse.Code))
            return BadRequest(tokenResponse);

        return Ok(tokenResponse);
    }

    [HttpPost("sync/{storeId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(LazadaSyncResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SyncStoreReviews(Guid storeId, [FromQuery] int maxPages = 3)
    {
        try
        {
            var result = await apiService.SyncStoreReviewsAsync(storeId, maxPages);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to sync Lazada store reviews for StoreId: {StoreId}", storeId);
            return StatusCode(500, new { detail = "Lazada API sync failed." });
        }
    }
}

