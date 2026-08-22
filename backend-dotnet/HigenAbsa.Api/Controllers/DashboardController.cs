// Controllers/DashboardController.cs - Dashboard & Reporting Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Dashboard;
using HigenAbsa.Api.Services.Dashboard;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    /// <summary>
    /// Get dashboard KPI summary with period comparisons.
    /// </summary>
    [HttpGet("kpi")]
    [ProducesResponseType(typeof(DashboardKpiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpi(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var kpi = await dashboardService.GetKpiAsync(dateFrom, dateTo);
        return Ok(kpi);
    }

    /// <summary>
    /// Get sentiment trend data grouped by day/week/month.
    /// </summary>
    [HttpGet("sentiment-trend")]
    [ProducesResponseType(typeof(List<SentimentTrendDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSentimentTrend(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string groupBy = "day")
    {
        var trend = await dashboardService.GetSentimentTrendAsync(dateFrom, dateTo, groupBy);
        return Ok(trend);
    }

    /// <summary>
    /// Get review distribution across connected e-commerce platforms.
    /// </summary>
    [HttpGet("platform-distribution")]
    [ProducesResponseType(typeof(List<PlatformDistributionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlatformDistribution(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var distribution = await dashboardService.GetPlatformDistributionAsync(dateFrom, dateTo);
        return Ok(distribution);
    }

    /// <summary>
    /// Get products with the highest negative review spikes in recent days.
    /// </summary>
    [HttpGet("negative-spikes")]
    [ProducesResponseType(typeof(List<NegativeSpikeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNegativeSpikes([FromQuery] int days = 7)
    {
        var spikes = await dashboardService.GetNegativeSpikesAsync(days);
        return Ok(spikes);
    }

    /// <summary>
    /// Get the most recent reviews as a live feed.
    /// </summary>
    [HttpGet("recent-reviews")]
    [ProducesResponseType(typeof(List<RecentReviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentReviews([FromQuery] int count = 10)
    {
        var reviews = await dashboardService.GetRecentReviewsAsync(count);
        return Ok(reviews);
    }
}
