using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Modules.Reporting.Application.Handlers;
using HigenAbsa.Modules.Reporting.Application.Services;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Reporting;

public static class ReportingModuleExtensions
{
    public static IServiceCollection AddReportingModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetConnectionString("SqlDefault")
            ?? "Server=localhost;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;";

        services.AddDbContext<ReportingDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", ReportingDbContext.SchemaName)));

        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IDashboardService, DashboardService>();

        services.AddScoped<UserAuditEventHandler>();
        services.AddScoped<ReportingReviewCreatedEventHandler>();
        services.AddScoped<ReportingReviewAnalyzedEventHandler>();

        services.AddTransient<IIntegrationEventHandler<UserAuditIntegrationEvent>, UserAuditEventHandler>();
        services.AddTransient<IIntegrationEventHandler<ReviewCreatedIntegrationEvent>, ReportingReviewCreatedEventHandler>();
        services.AddTransient<IIntegrationEventHandler<ReviewAnalyzedIntegrationEvent>, ReportingReviewAnalyzedEventHandler>();

        services.AddControllers()
            .AddApplicationPart(typeof(ReportingModuleExtensions).Assembly);

        return services;
    }
}

