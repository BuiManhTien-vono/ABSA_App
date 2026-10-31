using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/products")]
[Authorize]
public class ProductController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null,
        [FromQuery] string? search = null)
    {
        var result = await productService.GetProductsAsync(page, pageSize, storeId, search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var product = await productService.GetProductByIdAsync(id);
        if (product == null) return NotFound(new { detail = "Product not found." });
        return Ok(product);
    }

    [HttpGet("{id:guid}/reviews")]
    [ProducesResponseType(typeof(PagedResult<ReviewListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductReviews(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] byte? rating = null,
        [FromQuery] string? sentiment = null)
    {
        var result = await productService.GetProductReviewsAsync(id, page, pageSize, rating, sentiment);
        return Ok(result);
    }

    [HttpGet("{id:guid}/sentiment-summary")]
    [ProducesResponseType(typeof(ProductSentimentSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductSentimentSummary(Guid id)
    {
        var summary = await productService.GetProductSentimentSummaryAsync(id);
        if (summary == null) return NotFound(new { detail = "Product not found." });
        return Ok(summary);
    }
}

