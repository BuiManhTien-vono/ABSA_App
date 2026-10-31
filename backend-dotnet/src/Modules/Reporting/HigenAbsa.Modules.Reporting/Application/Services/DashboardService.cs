using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Application.DTOs;
using HigenAbsa.Modules.Reporting.Infrastructure;

namespace HigenAbsa.Modules.Reporting.Application.Services;

public class DashboardService(ReportingDbContext db) : IDashboardService
{
    public async Task<DashboardKpiDto> GetKpiAsync(DateTime? dateFrom, DateTime? dateTo)
    {
        var now = DateTimeOffset.UtcNow;
        var todayStart = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero);
        var yesterdayStart = todayStart.AddDays(-1);

        var reviewsQuery = db.ReadReviews.AsNoTracking().AsQueryable();
        if (dateFrom.HasValue) reviewsQuery = reviewsQuery.Where(r => r.ReviewCreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) reviewsQuery = reviewsQuery.Where(r => r.ReviewCreatedAt <= dateTo.Value);

        var totalReviews = await reviewsQuery.CountAsync();
        var todayReviews = await db.ReadReviews.CountAsync(r => r.ReviewCreatedAt >= todayStart);
        var yesterdayReviews = await db.ReadReviews.CountAsync(r =>
            r.ReviewCreatedAt >= yesterdayStart && r.ReviewCreatedAt < todayStart);

        var todayChangePercent = yesterdayReviews > 0
            ? Math.Round(100.0 * (todayReviews - yesterdayReviews) / yesterdayReviews, 1)
            : todayReviews > 0 ? 100.0 : 0;

        // Sentiment breakdown
        var aiQuery = db.ReadAnalyses.AsNoTracking().AsQueryable();
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

        // Previous period POS comparison
        var prevWeekStart = now.AddDays(-14);
        var prevWeekEnd = now.AddDays(-7);
        var prevPosCount = await db.ReadAnalyses.CountAsync(a =>
            a.OverallSentiment == "POS" && a.ProcessedAt >= prevWeekStart && a.ProcessedAt < prevWeekEnd);
        var currPosCount = await db.ReadAnalyses.CountAsync(a =>
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
            TotalProducts = await db.ReadProducts.CountAsync(),
            ConnectedStores = await db.ReadStores.CountAsync(s => s.Status == "CONNECTED"),
            OpenTickets = await db.ReadTickets.CountAsync(t => t.Status == "OPEN" || t.Status == "IN_PROGRESS")
        };
    }

    public async Task<List<SentimentTrendDto>> GetSentimentTrendAsync(
        DateTime? dateFrom, DateTime? dateTo, string groupBy)
    {
        var from = dateFrom.HasValue ? new DateTimeOffset(dateFrom.Value, TimeSpan.Zero) : DateTimeOffset.UtcNow.AddDays(-30);
        var to = dateTo.HasValue ? new DateTimeOffset(dateTo.Value, TimeSpan.Zero) : DateTimeOffset.UtcNow;

        var analyses = await db.ReadAnalyses.AsNoTracking()
            .Where(a => a.ProcessedAt >= from && a.ProcessedAt <= to)
            .Select(a => new { a.ProcessedAt, a.OverallSentiment })
            .ToListAsync();

        var grouped = analyses.GroupBy(a => groupBy.ToLowerInvariant() switch
        {
            "week" => a.ProcessedAt.Date.AddDays(-(int)a.ProcessedAt.DayOfWeek).ToString("yyyy-MM-dd"),
            "month" => a.ProcessedAt.ToString("yyyy-MM"),
            _ => a.ProcessedAt.ToString("yyyy-MM-dd")
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
        var query = from r in db.ReadReviews.AsNoTracking()
                    join s in db.ReadStores.AsNoTracking() on r.StoreId equals s.Id
                    join p in db.ReadPlatforms.AsNoTracking() on s.PlatformId equals p.Id
                    select new { r.ReviewCreatedAt, p.Code, p.Name };

        if (dateFrom.HasValue) query = query.Where(r => r.ReviewCreatedAt >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(r => r.ReviewCreatedAt <= dateTo.Value);

        var distribution = await query
            .GroupBy(x => new { x.Code, x.Name })
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
        var since = DateTimeOffset.UtcNow.AddDays(-Math.Max(1, days));

        var negQuery = from a in db.ReadAnalyses.AsNoTracking()
                       join r in db.ReadReviews.AsNoTracking() on a.ReviewId equals r.Id
                       join p in db.ReadProducts.AsNoTracking() on r.ProductId equals p.Id
                       join s in db.ReadStores.AsNoTracking() on r.StoreId equals s.Id
                       where a.OverallSentiment == "NEG" && a.ProcessedAt >= since && r.ProductId != null
                       select new { ProductId = p.Id, ProductName = p.Name, StoreName = s.StoreName };

        var negList = await negQuery.ToListAsync();

        var grouped = negList
            .GroupBy(x => new { x.ProductId, x.ProductName, x.StoreName })
            .Select(g => new NegativeSpikeDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                StoreName = g.Key.StoreName,
                NegCount = g.Count(),
                TotalReviews = db.ReadReviews.Count(r => r.ProductId == g.Key.ProductId && r.ReviewCreatedAt >= since)
            })
            .OrderByDescending(s => s.NegCount)
            .Take(10)
            .ToList();

        foreach (var item in grouped)
        {
            item.NegPercent = item.TotalReviews > 0
                ? Math.Round(100.0 * item.NegCount / item.TotalReviews, 1) : 0;
        }

        return grouped;
    }

    public async Task<List<RecentReviewDto>> GetRecentReviewsAsync(int count)
    {
        count = Math.Clamp(count, 1, 50);

        var recentReviews = await db.ReadReviews.AsNoTracking()
            .OrderByDescending(r => r.ReviewCreatedAt)
            .Take(count)
            .ToListAsync();

        var reviewIds = recentReviews.Select(r => r.Id).ToList();
        var productIds = recentReviews.Where(r => r.ProductId.HasValue).Select(r => r.ProductId!.Value).Distinct().ToList();
        var storeIds = recentReviews.Select(r => r.StoreId).Distinct().ToList();
        var customerIds = recentReviews.Where(r => r.CustomerId.HasValue).Select(r => r.CustomerId!.Value).Distinct().ToList();

        var analyses = await db.ReadAnalyses.AsNoTracking()
            .Where(a => reviewIds.Contains(a.ReviewId))
            .ToDictionaryAsync(a => a.ReviewId, a => a.OverallSentiment);

        var products = await db.ReadProducts.AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var stores = await db.ReadStores.AsNoTracking()
            .Where(s => storeIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s.StoreName);

        var customers = await db.ReadCustomers.AsNoTracking()
            .Where(c => customerIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Name ?? "");

        return recentReviews.Select(r => new RecentReviewDto
        {
            Id = r.Id,
            CommentText = r.CommentText,
            Rating = (byte)r.Rating,
            OverallSentiment = analyses.TryGetValue(r.Id, out var sent) ? sent : null,
            CustomerName = r.CustomerId.HasValue && customers.TryGetValue(r.CustomerId.Value, out var cName) ? cName : null,
            ProductName = r.ProductId.HasValue && products.TryGetValue(r.ProductId.Value, out var pName) ? pName : null,
            StoreName = stores.TryGetValue(r.StoreId, out var sName) ? sName : null,
            ReviewCreatedAt = r.ReviewCreatedAt
        }).ToList();
    }

    public async Task<List<AspectSummaryDto>> GetAspectSummaryAsync(Guid? storeId = null)
    {
        var query = from a in db.ReadAspects.AsNoTracking()
                    join r in db.ReadReviews.AsNoTracking() on a.ReviewId equals r.Id
                    select new { a.MacroCategory, a.MicroAspect, a.Sentiment, r.StoreId };

        if (storeId.HasValue)
        {
            query = query.Where(x => x.StoreId == storeId.Value);
        }

        var aspects = await query
            .GroupBy(a => new { a.MacroCategory, a.MicroAspect })
            .Select(g => new AspectSummaryDto
            {
                MacroCategory = g.Key.MacroCategory,
                MicroAspect = g.Key.MicroAspect,
                TotalMentions = g.Count(),
                PositiveMentions = g.Count(x => x.Sentiment == "POS"),
                NeutralMentions = g.Count(x => x.Sentiment == "NEU"),
                NegativeMentions = g.Count(x => x.Sentiment == "NEG")
            })
            .OrderByDescending(a => a.TotalMentions)
            .Take(15)
            .ToListAsync();

        return aspects;
    }
}

