using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using HigenAbsa.Modules.Inference.Application.Contracts;
using HigenAbsa.Modules.Inference.Application.DTOs;
using HigenAbsa.Modules.Inference.Application.Handlers;
using HigenAbsa.Modules.Inference.Application.Services;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Inference;

public static class InferenceModuleExtensions
{
    public static IServiceCollection AddInferenceModule(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

        services.AddDbContext<InferenceDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null)));

        var absaOptions = configuration.GetSection(AbsaOptions.SectionName).Get<AbsaOptions>()
            ?? new AbsaOptions();

        if (!Path.IsPathRooted(absaOptions.ModelDir))
        {
            absaOptions.ModelDir = Path.GetFullPath(
                Path.Combine(environment.ContentRootPath, absaOptions.ModelDir));
        }

        services.AddSingleton(absaOptions);
        services.AddSingleton<ModelBundle>();
        services.AddSingleton<IInferenceService, InferenceService>();
        services.AddScoped<IExcelAnalysisService, ExcelAnalysisService>();

        services.AddScoped<IInferenceLookupContract, InferenceLookupService>();
        services.AddScoped<IIntegrationEventHandler<ReviewCreatedIntegrationEvent>, ReviewCreatedEventHandler>();

        return services;
    }
}

