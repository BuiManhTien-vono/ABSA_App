// Services/Dashboard/DashboardService.cs - Dashboard & Reporting Aggregation Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Models.Dashboard;

namespace HigenAbsa.Api.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardKpiDto> GetKpiAsync(DateTime? dateFrom, DateTime? dateTo);
    Task<List<SentimentTrendDto>> GetSentimentTrendAsync(DateTime? dateFrom, DateTime? dateTo, string groupBy);
    Task<List<PlatformDistributionDto>> GetPlatformDistributionAsync(DateTime? dateFrom, DateTime? dateTo);
    Task<List<NegativeSpikeDto>> GetNegativeSpikesAsync(int days);
    Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count);
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardKpiDto> GetKpiAsync(DateTime? dateFrom, DateTime? dateTo)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var yesterdayStart = todayStart.AddDays(-1);

        var reviewsQuery = _db.Reviews.AsQueryable();
        if (dateFrom.HasValue) reviewsQuery = reviewsQuery.Where(r => r.ReviewCreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) reviewsQuery = reviewsQuery.Where(r => r.ReviewCreatedAt <= dateTo.Value);

        var totalReviews = await reviewsQuery.CountAsync();
        var todayReviews = await _db.Reviews.CountAsync(r => r.ReviewCreatedAt >= todayStart);
        var yesterdayReviews = await _db.Reviews.CountAsync(r =>
            r.ReviewCreatedAt >= yesterdayStart && r.ReviewCreatedAt < todayStart);

        var todayChangePercent = yesterdayReviews > 0
            ? Math.Round(100.0 * (todayReviews - yesterdayReviews) / yesterdayReviews, 1)
            : todayReviews > 0 ? 100.0 : 0;

        // Sentiment breakdown
        var aiQuery = _db.ReviewAIAnalyses.AsQueryable();
        if (dateFrom.HasValue) aiQuery = aiQuery.Where(a => a.ProcessedAt >= dateFrom.Value);
        if (dateTo.HasValue) aiQuery = aiQuery.Where(a => a.ProcessedAt <= dateTo.Value);

        var sentimentCounts = await aiQuery
            .GroupBy(a => a.OverallSentiment)
            .Select(g => new { Sentiment = g.Key, Count = g.Count() })
            .ToListAsync();

        var totalAnalyzed = sentimentCounts.Sum(s => s.Count);
        var posCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "POS")?.Count ?? 0;
        var neuCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEU")?.Count ?? 0;
        var negCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEG")?.Count ?? 0;

        // Previous period POS for comparison
        var prevWeekStart = now.AddDays(-14);
        var prevWeekEnd = now.AddDays(-7);
        var prevPosCount = await _db.ReviewAIAnalyses.CountAsync(a =>
            a.OverallSentiment == "POS" && a.ProcessedAt >= prevWeekStart && a.ProcessedAt < prevWeekEnd);
        var currPosCount = await _db.ReviewAIAnalyses.CountAsync(a =>
            a.OverallSentiment == "POS" && a.ProcessedAt >= prevWeekEnd);
        var posChangePercent = prevPosCount > 0
            ? Math.Round(100.0 * (currPosCount - prevPosCount) / prevPosCount, 1) : 0;

        return new DashboardKpiDto
        {
            TotalReviews = totalReviews,
            TodayReviews = todayReviews,
            TodayChangePercent = todayChangePercent,
            PosPercent = totalAnalyzed > 0 ? Math.Round(100.0 * posCount / totalAnalyzed, 1) : 0,
            NeuPercent = totalAnalyzed > 0 ? Math.Round(100.0 * neuCount / totalAnalyzed, 1) : 0,
            NegPercent = totalAnalyzed > 0 ? Math.Round(100.0 * negCount / totalAnalyzed, 1) : 0,
            PosChangePercent = posChangePercent,
            TotalProducts = await _db.Products.CountAsync(),
            ConnectedStores = await _db.StoreConnections.CountAsync(s => s.Status == "CONNECTED"),
            OpenTickets = await _db.Tickets.CountAsync(t => t.Status == "OPEN" || t.Status == "IN_PROGRESS")
        };
    }

    public async Task<List<SentimentTrendDto>> GetSentimentTrendAsync(
        DateTime? dateFrom, DateTime? dateTo, string groupBy)
    {
        var from = dateFrom ?? DateTime.UtcNow.AddDays(-30);
        var to = dateTo ?? DateTime.UtcNow;

        var analyses = await _db.ReviewAIAnalyses
            .Where(a => a.ProcessedAt >= from && a.ProcessedAt <= to)
            .Select(a => new { a.ProcessedAt, a.OverallSentiment })
            .ToListAsync();

        // Group by date string based on groupBy parameter
        var grouped = analyses.GroupBy(a => groupBy.ToLower() switch
        {
            "week" => a.ProcessedAt.Date.AddDays(-(int)a.ProcessedAt.DayOfWeek).ToString("yyyy-MM-dd"),
            "month" => a.ProcessedAt.ToString("yyyy-MM"),
            _ => a.ProcessedAt.ToString("yyyy-MM-dd") // default: day
        });

        return grouped
            .Select(g => new SentimentTrendDto
            {
                Date = g.Key,
                PosCount = g.Count(x => x.OverallSentiment == "POS"),
                NeuCount = g.Count(x => x.OverallSentiment == "NEU"),
                NegCount = g.Count(x => x.OverallSentiment == "NEG"),
                TotalCount = g.Count()
            })
            .OrderBy(t => t.Date)
            .ToList();
    }

    public async Task<List<PlatformDistributionDto>> GetPlatformDistributionAsync(
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = _db.Reviews
            .Include(r => r.Store).ThenInclude(s => s!.Platform)
            .Where(r => r.Store != null && r.Store.Platform != null);

        if (dateFrom.HasValue) query = query.Where(r => r.ReviewCreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(r => r.ReviewCreatedAt <= dateTo.Value);

        var distribution = await query
            .GroupBy(r => new { r.Store!.Platform!.Code, r.Store.Platform.Name })
            .Select(g => new { g.Key.Code, g.Key.Name, Count = g.Count() })
            .ToListAsync();

        var total = distribution.Sum(d => d.Count);

        return distribution.Select(d => new PlatformDistributionDto
        {
            PlatformCode = d.Code,
            PlatformName = d.Name,
            ReviewCount = d.Count,
            Percentage = total > 0 ? Math.Round(100.0 * d.Count / total, 1) : 0
        }).OrderByDescending(d => d.ReviewCount).ToList();
    }

    public async Task<List<NegativeSpikeDto>> GetNegativeSpikesAsync(int days)
    {
        var since = DateTime.UtcNow.AddDays(-Math.Max(1, days));

        var negByProduct = await _db.ReviewAIAnalyses
            .Include(a => a.Review).ThenInclude(r => r!.Product)
            .Include(a => a.Review).ThenInclude(r => r!.Store)
            .Where(a => a.OverallSentiment == "NEG" &&
                        a.ProcessedAt >= since &&
                        a.Review != null && a.Review.ProductId != null)
            .GroupBy(a => new
            {
                a.Review!.ProductId,
                ProductName = a.Review.Product!.Name,
                StoreName = a.Review.Store != null ? a.Review.Store.StoreName : ""
            })
            .Select(g => new NegativeSpikeDto
            {
                ProductId = g.Key.ProductId!.Value,
                ProductName = g.Key.ProductName,
                StoreName = g.Key.StoreName,
                NegCount = g.Count(),
                TotalReviews = _db.Reviews.Count(r => r.ProductId == g.Key.ProductId && r.ReviewCreatedAt >= since),
            })
            .OrderByDescending(s => s.NegCount)
            .Take(10)
            .ToListAsync();

        // Calculate percentages
        foreach (var item in negByProduct)
        {
            item.NegPercent = item.TotalReviews > 0
                ? Math.Round(100.0 * item.NegCount / item.TotalReviews, 1) : 0;
        }

        return negByProduct;
    }

    public async Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count)
    {
        count = Math.Clamp(count, 1, 50);

        return await _db.Reviews
            .Include(r => r.AIAnalysis)
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .Include(r => r.Store)
            .OrderByDescending(r => r.ReviewCreatedAt)
            .Take(count)
            .Select(r => new RecentReviewDto
            {
                Id = r.Id,
                CommentText = r.CommentText,
                Rating = r.Rating,
                OverallSentiment = r.AIAnalysis != null ? r.AIAnalysis.OverallSentiment : null,
                CustomerName = r.Customer != null ? r.Customer.DisplayName : null,
                ProductName = r.Product != null ? r.Product.Name : null,
                StoreName = r.Store != null ? r.Store.StoreName : null,
                ReviewCreatedAt = r.ReviewCreatedAt
            })
            .ToListAsync();
    }
}
