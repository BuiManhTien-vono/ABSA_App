using HigenAbsa.Modules.Engagement.Domain;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Events;
using Microsoft.EntityFrameworkCore;

namespace HigenAbsa.Modules.Engagement.Application.Handlers;

public sealed class NegativeReviewDetectedEventHandler(
    EngagementDbContext db) : IIntegrationEventHandler<NegativeReviewDetectedIntegrationEvent>
{
    public async Task HandleAsync(
        NegativeReviewDetectedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.Tickets
            .AnyAsync(t => t.ReviewId == integrationEvent.ReviewId, cancellationToken);
        if (existing) return;

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            ReviewId = integrationEvent.ReviewId,
            StoreId = integrationEvent.StoreId,
            CustomerName = integrationEvent.CustomerName,
            CustomerPhone = integrationEvent.CustomerPhone,
            Title = integrationEvent.Title,
            Description = integrationEvent.Description,
            Priority = integrationEvent.Priority,
            Status = "OPEN",
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Tickets.Add(ticket);
        await db.SaveChangesAsync(cancellationToken);
    }
}

