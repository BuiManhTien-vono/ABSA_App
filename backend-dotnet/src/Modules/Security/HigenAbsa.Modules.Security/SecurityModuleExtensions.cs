using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Modules.Security.Application.Contracts;
using HigenAbsa.Modules.Security.Application.Services;
using HigenAbsa.Modules.Security.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Security;

public static class SecurityModuleExtensions
{
    public static IServiceCollection AddSecurityModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

        services.AddDbContext<SecurityDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null)));

        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserLookupContract, SecurityUserLookupService>();

        return services;
    }
}

