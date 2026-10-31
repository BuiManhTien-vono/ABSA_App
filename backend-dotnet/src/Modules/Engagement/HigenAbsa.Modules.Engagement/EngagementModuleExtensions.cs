using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Modules.Engagement.Application.Handlers;
using HigenAbsa.Modules.Engagement.Application.Services;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Engagement;

public static class EngagementModuleExtensions
{
    public static IServiceCollection AddEngagementModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetConnectionString("SqlDefault")
            ?? "Server=localhost;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;";

        services.AddDbContext<EngagementDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", EngagementDbContext.SchemaName)));

        services.AddScoped<IResponseService, ResponseService>();
        services.AddScoped<ITicketService, TicketService>();

        services.AddScoped<NegativeReviewDetectedEventHandler>();
        services.AddScoped<ReviewCreatedEventHandler>();

        // Register Integration Event Handlers with the in-memory bus
        services.AddTransient<IIntegrationEventHandler<NegativeReviewDetectedIntegrationEvent>, NegativeReviewDetectedEventHandler>();
        services.AddTransient<IIntegrationEventHandler<ReviewCreatedIntegrationEvent>, ReviewCreatedEventHandler>();

        services.AddControllers()
            .AddApplicationPart(typeof(EngagementModuleExtensions).Assembly);

        return services;
    }
}

