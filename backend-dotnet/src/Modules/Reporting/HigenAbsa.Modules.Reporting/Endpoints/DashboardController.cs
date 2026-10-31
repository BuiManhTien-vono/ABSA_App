using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.Reporting.Application.DTOs;
using HigenAbsa.Modules.Reporting.Application.Services;

namespace HigenAbsa.Modules.Reporting.Endpoints;

[ApiController]
[Route("api/v1/dashboard")]
[AllowAnonymous]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("kpi")]
    [ProducesResponseType(typeof(DashboardKpiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpi(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var kpi = await dashboardService.GetKpiAsync(dateFrom, dateTo);
        return Ok(kpi);
    }

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

    [HttpGet("platform-distribution")]
    [ProducesResponseType(typeof(List<PlatformDistributionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlatformDistribution(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var distribution = await dashboardService.GetPlatformDistributionAsync(dateFrom, dateTo);
        return Ok(distribution);
    }

    [HttpGet("negative-spikes")]
    [ProducesResponseType(typeof(List<NegativeSpikeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNegativeSpikes([FromQuery] int days = 7)
    {
        var spikes = await dashboardService.GetNegativeSpikesAsync(days);
        return Ok(spikes);
    }

    [HttpGet("recent-reviews")]
    [ProducesResponseType(typeof(List<RecentReviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentReviews([FromQuery] int count = 10)
    {
        var reviews = await dashboardService.GetRecentReviewsAsync(count);
        return Ok(reviews);
    }

    [HttpGet("aspect-summary")]
    [ProducesResponseType(typeof(List<AspectSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAspectSummary([FromQuery] Guid? storeId = null)
    {
        var aspects = await dashboardService.GetAspectSummaryAsync(storeId);
        return Ok(aspects);
    }
}

