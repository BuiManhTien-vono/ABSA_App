using HigenAbsa.Modules.Reporting.Application.Services;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Reporting.Application.Handlers;

public sealed class UserAuditEventHandler(IAuditLogService auditLogService)
    : IIntegrationEventHandler<UserAuditIntegrationEvent>
{
    public async Task HandleAsync(
        UserAuditIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        await auditLogService.LogAsync(
            integrationEvent.UserId,
            integrationEvent.Action,
            integrationEvent.EntityName,
            integrationEvent.EntityId,
            details: integrationEvent.Details,
            ipAddress: integrationEvent.IpAddress);
    }
}

