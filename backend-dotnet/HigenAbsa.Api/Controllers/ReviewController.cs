// Controllers/ReviewController.cs - Review Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Review;
using HigenAbsa.Api.Services.Review;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/reviews")]
[Authorize]
public class ReviewController(IReviewService reviewService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of reviews with multi-dimensional filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ReviewListDto>), StatusCodes.Status200OK)]
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
        var result = await reviewService.GetReviewsAsync(
            page, pageSize, storeId, productId, rating, sentiment, status, search);
        return Ok(result);
    }

    /// <summary>
    /// Get full review details including AI analysis, aspects, keywords, and response history.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReviewDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReviewById(Guid id)
    {
        var review = await reviewService.GetReviewByIdAsync(id);
        if (review == null) return NotFound(new { detail = "Review not found." });
        return Ok(review);
    }

    /// <summary>
    /// Update the processing status of a review.
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(ReviewListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReviewStatus(Guid id, [FromBody] UpdateReviewStatusRequest request)
    {
        var review = await reviewService.UpdateReviewStatusAsync(id, request.Status);
        if (review == null) return NotFound(new { detail = "Review not found." });
        return Ok(review);
    }
}
