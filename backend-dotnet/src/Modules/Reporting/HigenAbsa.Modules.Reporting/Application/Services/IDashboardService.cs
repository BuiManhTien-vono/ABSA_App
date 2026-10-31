using HigenAbsa.Modules.Reporting.Application.DTOs;

namespace HigenAbsa.Modules.Reporting.Application.Services;

public interface IDashboardService
{
    Task<DashboardKpiDto> GetKpiAsync(DateTime? dateFrom, DateTime? dateTo);
    Task<List<SentimentTrendDto>> GetSentimentTrendAsync(DateTime? dateFrom, DateTime? dateTo, string groupBy);
    Task<List<PlatformDistributionDto>> GetPlatformDistributionAsync(DateTime? dateFrom, DateTime? dateTo);
    Task<List<NegativeSpikeDto>> GetNegativeSpikesAsync(int days);
    Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count);
    Task<List<AspectSummaryDto>> GetAspectSummaryAsync(Guid? storeId = null);
}

