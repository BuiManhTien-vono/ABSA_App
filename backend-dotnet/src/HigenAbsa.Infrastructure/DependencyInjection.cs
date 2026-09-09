using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;
using HigenAbsa.Infrastructure.Repositories;
using HigenAbsa.Application.Services.Inference;
using HigenAbsa.Infrastructure.Services.Inference;
using HigenAbsa.Application.Services.Lazada;
using HigenAbsa.Infrastructure.Services.Lazada;
using HigenAbsa.Application.Services.Auth;
using HigenAbsa.Infrastructure.Services.Auth;

namespace HigenAbsa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 1. Database Context
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        // 2. Repositories & Unit of Work
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // 3. Security / Auth Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        // 4. AI & Inference Services
        services.AddSingleton<ModelBundle>();
        services.AddSingleton<IInferenceService, InferenceService>();
        services.AddScoped<IExcelAnalysisService, ExcelAnalysisService>();

        // 5. Lazada Integration Services
        services.AddHttpClient<ILazadaApiService, LazadaApiService>();
        services.AddHttpClient<ILazadaAuthService, LazadaAuthService>();
        services.AddScoped<ILazadaSignatureService, LazadaSignatureService>();

        return services;
    }
}
