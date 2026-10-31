using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Domain;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Reporting.Application.Handlers;

public sealed class ReportingReviewCreatedEventHandler(ReportingDbContext db)
    : IIntegrationEventHandler<ReviewCreatedIntegrationEvent>
{
    public async Task HandleAsync(
        ReviewCreatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(integrationEvent.OccurredOnUtc.DateTime);
        var summary = await db.DailyPlatformSummaries
            .FirstOrDefaultAsync(s => s.SummaryDate == today && s.PlatformCode == "ALL", cancellationToken);

        if (summary == null)
        {
            summary = new DailyPlatformSummary
            {
                Id = Guid.NewGuid(),
                SummaryDate = today,
                PlatformCode = "ALL",
                TotalReviews = 1,
                CreatedAt = DateTimeOffset.UtcNow
            };
            db.DailyPlatformSummaries.Add(summary);
        }
        else
        {
            summary.TotalReviews += 1;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}

public sealed class ReportingReviewAnalyzedEventHandler(ReportingDbContext db)
    : IIntegrationEventHandler<ReviewAnalyzedIntegrationEvent>
{
    public async Task HandleAsync(
        ReviewAnalyzedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(integrationEvent.OccurredOnUtc.DateTime);
        var summary = await db.DailyPlatformSummaries
            .FirstOrDefaultAsync(s => s.SummaryDate == today && s.PlatformCode == "ALL", cancellationToken);

        if (summary == null)
        {
            summary = new DailyPlatformSummary
            {
                Id = Guid.NewGuid(),
                SummaryDate = today,
                PlatformCode = "ALL",
                TotalReviews = 1,
                PositiveCount = integrationEvent.OverallSentiment == "POS" ? 1 : 0,
                NeutralCount = integrationEvent.OverallSentiment == "NEU" ? 1 : 0,
                NegativeCount = integrationEvent.OverallSentiment == "NEG" ? 1 : 0,
                CreatedAt = DateTimeOffset.UtcNow
            };
            db.DailyPlatformSummaries.Add(summary);
        }
        else
        {
            if (integrationEvent.OverallSentiment == "POS") summary.PositiveCount += 1;
            else if (integrationEvent.OverallSentiment == "NEU") summary.NeutralCount += 1;
            else if (integrationEvent.OverallSentiment == "NEG") summary.NegativeCount += 1;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}

