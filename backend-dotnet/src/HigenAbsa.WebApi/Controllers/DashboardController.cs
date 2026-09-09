using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Infrastructure.Data;
using HigenAbsa.Infrastructure.Services.Inference;
using HigenAbsa.Application.Common;
using HigenAbsa.Application.Services;
using HigenAbsa.Application.Services.Auth;
using HigenAbsa.Application.Services.Inference;
using HigenAbsa.Application.Services.Lazada;
using HigenAbsa.Application.DTOs;
using HigenAbsa.Application.DTOs.Auth;
using HigenAbsa.Application.DTOs.Inference;
using HigenAbsa.Application.DTOs.Lazada;
// Controllers/DashboardController.cs - Dashboard & Reporting Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Application.DTOs.Dashboard;
using HigenAbsa.Application.Services.Dashboard;

using HigenAbsa.Application.DTOs.Inference;

namespace HigenAbsa.WebApi.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[AllowAnonymous]
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

    /// <summary>
    /// Get aspect sentiment breakdown summarized from database.
    /// </summary>
    [HttpGet("aspect-summary")]
    [ProducesResponseType(typeof(List<AspectSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAspectSummary([FromQuery] Guid? storeId = null)
    {
        var aspects = await dashboardService.GetAspectSummaryAsync(storeId);
        return Ok(aspects);
    }
}


