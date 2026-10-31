using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/reviews")]
[Authorize]
public class ReviewController(IReviewService reviewService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ReviewListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] byte? rating = null,
        [FromQuery] string? sentiment = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var result = await reviewService.GetReviewsAsync(page, pageSize, storeId, productId, rating, sentiment, status, search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReviewDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReviewById(Guid id)
    {
        var review = await reviewService.GetReviewByIdAsync(id);
        if (review == null) return NotFound(new { detail = "Review not found." });
        return Ok(review);
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ReviewListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReviewStatusRequest request)
    {
        var result = await reviewService.UpdateReviewStatusAsync(id, request.Status);
        if (result == null) return NotFound(new { detail = "Review not found." });
        return Ok(result);
    }
}

