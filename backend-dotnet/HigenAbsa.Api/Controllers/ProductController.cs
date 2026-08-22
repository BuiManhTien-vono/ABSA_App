// Controllers/ProductController.cs - Product Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Product;
using HigenAbsa.Api.Models.Review;
using HigenAbsa.Api.Services.Product;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/products")]
[Authorize]
public class ProductController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of products with optional filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null,
        [FromQuery] string? search = null)
    {
        var result = await productService.GetProductsAsync(page, pageSize, storeId, search);
        return Ok(result);
    }

    /// <summary>
    /// Get product details with review statistics.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var product = await productService.GetProductByIdAsync(id);
        if (product == null) return NotFound(new { detail = "Product not found." });
        return Ok(product);
    }

    /// <summary>
    /// Get reviews for a specific product.
    /// </summary>
    [HttpGet("{id:guid}/reviews")]
    [ProducesResponseType(typeof(List<ReviewListDto>), StatusCodes.Status200OK)]
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

    /// <summary>
    /// Get sentiment summary (aspect breakdown) for a product.
    /// </summary>
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
