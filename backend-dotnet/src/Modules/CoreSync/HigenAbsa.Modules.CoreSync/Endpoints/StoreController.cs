using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/stores")]
[Authorize]
public class StoreController(IStoreService storeService) : ControllerBase
{
    [HttpGet("platforms")]
    [ProducesResponseType(typeof(List<PlatformDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlatforms()
    {
        var platforms = await storeService.GetPlatformsAsync();
        return Ok(platforms);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<StoreConnectionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStores(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await storeService.GetStoresAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStoreById(Guid id)
    {
        var store = await storeService.GetStoreByIdAsync(id);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }

    [HttpPost]
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

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStore(Guid id, [FromBody] UpdateStoreRequest request)
    {
        var store = await storeService.UpdateStoreAsync(id, request);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteStore(Guid id)
    {
        var success = await storeService.DeleteStoreAsync(id);
        if (!success) return NotFound(new { detail = "Store connection not found." });
        return Ok(new { message = "Store connection removed successfully." });
    }

    [HttpPost("{id:guid}/sync")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SyncStore(Guid id)
    {
        var store = await storeService.SyncStoreAsync(id);
        if (store == null) return NotFound(new { detail = "Store connection not found." });
        return Ok(store);
    }

    [HttpPost("seed-mock-lazada")]
    [ProducesResponseType(typeof(StoreConnectionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SeedMockLazadaStore()
    {
        var store = await storeService.SeedMockLazadaStoreAsync();
        return Ok(store);
    }
}

