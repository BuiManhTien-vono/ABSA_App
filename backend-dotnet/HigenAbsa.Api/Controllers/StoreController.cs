// Controllers/StoreController.cs - Store Connection & Platform Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Store;
using HigenAbsa.Api.Services.Store;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class StoreController(IStoreService storeService) : ControllerBase
{
    // -----------------------------------------------------------------------
    // Platforms
    // -----------------------------------------------------------------------

    /// <summary>
    /// Get all supported e-commerce platforms.
    /// </summary>
    [HttpGet("platforms")]
    [ProducesResponseType(typeof(List<PlatformDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlatforms()
    {
        var platforms = await storeService.GetPlatformsAsync();
        return Ok(platforms);
    }

    // -----------------------------------------------------------------------
    // Store Connections
    // -----------------------------------------------------------------------

    /// <summary>
    /// Get paginated list of store connections with optional search and status filter.
    /// </summary>
    [HttpGet("stores")]
    [ProducesResponseType(typeof(List<StoreConnectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStores(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await storeService.GetStoresAsync(page, pageSize, search, status);
        return Ok(result);
    }

    /// <summary>
    /// Get store connection details by ID.
    /// </summary>
    [HttpGet("stores/{id:guid}")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStoreById(Guid id)
    {
        var store = await storeService.GetStoreByIdAsync(id);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }

    /// <summary>
    /// Create a new store connection to an e-commerce platform.
    /// </summary>
    [HttpPost("stores")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
    {
        try
        {
            var store = await storeService.CreateStoreAsync(request);
            return CreatedAtAction(nameof(GetStoreById), new { id = store.Id }, store);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing store connection.
    /// </summary>
    [HttpPut("stores/{id:guid}")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStore(Guid id, [FromBody] UpdateStoreRequest request)
    {
        var store = await storeService.UpdateStoreAsync(id, request);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }

    /// <summary>
    /// Disconnect (soft-delete) a store connection.
    /// </summary>
    [HttpDelete("stores/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStore(Guid id)
    {
        var success = await storeService.DeleteStoreAsync(id);
        if (!success) return NotFound(new { detail = "Store connection not found." });
        return Ok(new { message = "Store disconnected successfully." });
    }

    /// <summary>
    /// Trigger manual sync for a store connection.
    /// </summary>
    [HttpPost("stores/{id:guid}/sync")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SyncStore(Guid id)
    {
        var store = await storeService.SyncStoreAsync(id);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }
}
