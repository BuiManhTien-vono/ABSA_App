using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.CoreSync.Application.Services;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/sample-data")]
[Authorize]
public class SampleDataController(ISampleDataService sampleDataService) : ControllerBase
{
    /// <summary>
    /// Seed dữ liệu mẫu vào SQL Server (mặc định 10 sản phẩm, mỗi sản phẩm 100 bình luận = 1.000 reviews).
    /// </summary>
    [HttpPost("seed-catalog")]
    [ProducesResponseType(typeof(SampleSeedResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SeedCatalog(
        [FromQuery] int productCount = 10,
        [FromQuery] int reviewsPerProduct = 100,
        [FromQuery] Guid? storeId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await sampleDataService.SeedCatalogAsync(productCount, reviewsPerProduct, storeId, cancellationToken);
            return Created("/api/v1/products", result);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }
}
