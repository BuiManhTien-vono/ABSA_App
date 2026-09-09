// Controllers/LazadaController.cs - Lazada Open Platform Integration Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models.Lazada;
using HigenAbsa.Api.Services.Lazada;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/lazada")]
public class LazadaController(
    ILazadaAuthService authService,
    ILazadaApiService apiService,
    AppDbContext db,
    ILogger<LazadaController> logger) : ControllerBase
{
    /// <summary>
    /// Redirect seller to Lazada Open Platform authorization page.
    /// </summary>
    [HttpGet("authorize")]
    [AllowAnonymous]
    public IActionResult Authorize([FromQuery] string? redirectUri, [FromQuery] string? state)
    {
        var authUrl = authService.GetAuthorizationUrl(redirectUri, state);
        logger.LogInformation("Redirecting seller to Lazada Auth URL: {Url}", authUrl);
        return Redirect(authUrl);
    }

    /// <summary>
    /// OAuth Callback endpoint invoked by Lazada after seller grants authorization.
    /// </summary>
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        [FromQuery] string? error_description)
    {
        if (!string.IsNullOrWhiteSpace(error))
        {
            logger.LogWarning("Lazada Authorization Error: {Error} - {Desc}", error, error_description);
            return BadRequest(new { error, error_description });
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            return BadRequest(new { detail = "Missing required 'code' parameter from Lazada callback." });
        }

        logger.LogInformation("Received Lazada Authorization Code: {Code}", code);

        try
        {
            var tokenResponse = await authService.CreateTokenAsync(code);

            if (tokenResponse.AccessToken != null)
            {
                // Auto create/update StoreConnection for Lazada Platform
                var lazadaPlatform = await db.Platforms.FirstOrDefaultAsync(p => p.Code == "LAZADA");
                int platformId = lazadaPlatform?.Id ?? 2;

                string storeAccount = tokenResponse.Account ?? "Lazada Seller Store";
                var store = await db.StoreConnections
                    .FirstOrDefaultAsync(s => s.PlatformId == platformId && s.StoreCodeOnPlatform == storeAccount);

                if (store == null)
                {
                    store = new StoreConnection
                    {
                        Id = Guid.NewGuid(),
                        PlatformId = platformId,
                        StoreName = $"Lazada - {storeAccount}",
                        StoreCodeOnPlatform = storeAccount,
                        AccessToken = tokenResponse.AccessToken,
                        RefreshToken = tokenResponse.RefreshToken,
                        TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn > 0 ? tokenResponse.ExpiresIn : 604800),
                        Status = "CONNECTED",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    db.StoreConnections.Add(store);
                }
                else
                {
                    store.AccessToken = tokenResponse.AccessToken;
                    store.RefreshToken = tokenResponse.RefreshToken ?? store.RefreshToken;
                    store.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn > 0 ? tokenResponse.ExpiresIn : 604800);
                    store.Status = "CONNECTED";
                    store.UpdatedAt = DateTime.UtcNow;
                }

                await db.SaveChangesAsync();

                return Ok(new
                {
                    message = "Lazada seller authorization completed successfully!",
                    store_id = store.Id,
                    store_name = store.StoreName,
                    access_token = tokenResponse.AccessToken,
                    refresh_token = tokenResponse.RefreshToken,
                    expires_in = tokenResponse.ExpiresIn,
                    account = tokenResponse.Account,
                    country = tokenResponse.Country
                });
            }

            return BadRequest(new
            {
                detail = "Failed to obtain Access Token from Lazada.",
                response = tokenResponse
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception during Lazada OAuth callback handling.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { detail = ex.Message });
        }
    }

    /// <summary>
    /// Explicitly exchange an authorization code for an Access Token.
    /// </summary>
    [HttpPost("token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LazadaTokenResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateToken([FromBody] LazadaTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { detail = "Authorization code is required." });
        }

        var result = await authService.CreateTokenAsync(request.Code);
        return Ok(result);
    }

    /// <summary>
    /// Fetch product reviews directly from Lazada Open Platform API.
    /// </summary>
    [HttpGet("reviews")]
    [Authorize]
    [ProducesResponseType(typeof(LazadaReviewListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLazadaReviews(
        [FromQuery] string accessToken,
        [FromQuery] long? itemId = null,
        [FromQuery] int pageNo = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return BadRequest(new { detail = "access_token parameter is required." });
        }

        var result = await apiService.GetProductReviewListAsync(accessToken, itemId, pageNo, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Sync product reviews from Lazada into SQL Server database and execute ABSA AI sentiment analysis.
    /// </summary>
    [HttpPost("sync-reviews")]
    [Authorize]
    [ProducesResponseType(typeof(LazadaSyncResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncLazadaReviews([FromBody] LazadaSyncRequest request)
    {
        try
        {
            var result = await apiService.SyncReviewsToDatabaseAsync(
                request.StoreId,
                null,
                request.ItemId,
                request.PageNo,
                request.PageSize);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error syncing Lazada product reviews.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { detail = ex.Message });
        }
    }
}
