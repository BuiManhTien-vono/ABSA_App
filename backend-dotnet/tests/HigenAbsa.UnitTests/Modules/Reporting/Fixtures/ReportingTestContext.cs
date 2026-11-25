using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Application.Handlers;
using HigenAbsa.Modules.Reporting.Application.Services;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.UnitTests.Modules.Engagement.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Reporting.Fixtures;

/// <summary>
/// Môi trường kiểm thử cô lập trên RAM (Test Fixture) cho Module 5: Reporting (Dashboard Analytics & Audit Logs).
/// </summary>
public sealed class ReportingTestContext : IDisposable
{
    public ReportingDbContext DbContext { get; }
    public FakeUserLookup UserLookup { get; }
    public DashboardService DashboardService { get; }
    public AuditLogService AuditLogService { get; }
    public ReportingReviewCreatedEventHandler ReviewCreatedHandler { get; }
    public ReportingReviewAnalyzedEventHandler ReviewAnalyzedHandler { get; }
    public UserAuditEventHandler UserAuditHandler { get; }

    public ReportingTestContext()
    {
        var options = new DbContextOptionsBuilder<ReportingDbContext>()
            .UseInMemoryDatabase($"HigenReportingTestDb_{Guid.NewGuid()}")
            .Options;

        DbContext = new ReportingDbContext(options);
        UserLookup = new FakeUserLookup();

        DashboardService = new DashboardService(DbContext);
        AuditLogService = new AuditLogService(DbContext, UserLookup);
        ReviewCreatedHandler = new ReportingReviewCreatedEventHandler(DbContext);
        ReviewAnalyzedHandler = new ReportingReviewAnalyzedEventHandler(DbContext);
        UserAuditHandler = new UserAuditEventHandler(AuditLogService);
    }

    public void Dispose()
    {
        DbContext.Dispose();
    }
}
