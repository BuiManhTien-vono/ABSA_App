using HigenAbsa.Modules.Engagement.Domain;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Events;
using Microsoft.EntityFrameworkCore;

namespace HigenAbsa.Modules.Engagement.Application.Handlers;

public sealed class ReviewCreatedEventHandler(
    EngagementDbContext db) : IIntegrationEventHandler<ReviewCreatedIntegrationEvent>
{
    public async Task HandleAsync(
        ReviewCreatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.ReviewResponses
            .AnyAsync(r => r.ReviewId == integrationEvent.ReviewId, cancellationToken);
        if (existing) return;

        var rule = await db.AutomationRules
            .Where(r => r.IsEnabled && (r.StoreId == null || r.StoreId == integrationEvent.StoreId))
            .Where(r => integrationEvent.Rating >= r.MinRating && integrationEvent.Rating <= r.MaxRating)
            .FirstOrDefaultAsync(cancellationToken);

        if (rule == null || !rule.SelectedTemplateId.HasValue) return;

        var template = await db.ResponseTemplates
            .FindAsync([rule.SelectedTemplateId.Value], cancellationToken);
        if (template == null || !template.IsActive) return;

        var response = new ReviewResponse
        {
            Id = Guid.NewGuid(),
            ReviewId = integrationEvent.ReviewId,
            ResponseText = template.ContentTemplate,
            ResponseType = "AUTOMATIC",
            TemplateId = template.Id,
            Status = "SENT",
            SentAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.ReviewResponses.Add(response);
        await db.SaveChangesAsync(cancellationToken);
    }
}

