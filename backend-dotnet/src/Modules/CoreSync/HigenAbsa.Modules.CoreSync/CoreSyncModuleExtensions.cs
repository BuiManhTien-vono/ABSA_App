using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Modules.CoreSync.Application.Contracts;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.CoreSync;

public static class CoreSyncModuleExtensions
{
    public static IServiceCollection AddCoreSyncModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

        services.AddDbContext<CoreSyncDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null)));

        services.AddHttpClient();

        var lazadaOptions = configuration.GetSection(LazadaOptions.SectionName).Get<LazadaOptions>()
            ?? new LazadaOptions();
        services.AddSingleton(lazadaOptions);

        services.AddSingleton<ILazadaSignatureService, LazadaSignatureService>();
        services.AddScoped<ILazadaAuthService, LazadaAuthService>();
        services.AddScoped<ILazadaApiService, LazadaApiService>();

        services.AddScoped<IStoreService, StoreService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IReviewService, ReviewService>();

        services.AddScoped<IStoreLookupContract, CoreSyncStoreLookupService>();
        services.AddScoped<IReviewLookupContract, CoreSyncReviewLookupService>();

        return services;
    }
}

