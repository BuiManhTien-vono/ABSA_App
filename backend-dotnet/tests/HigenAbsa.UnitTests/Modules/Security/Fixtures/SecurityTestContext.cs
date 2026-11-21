using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Infrastructure;
using HigenAbsa.Modules.Security.Application.Services;
using HigenAbsa.Modules.Security.Infrastructure;

namespace HigenAbsa.UnitTests.Modules.Security.Fixtures;

/// <summary>
/// Môi trường kiểm thử cô lập (Test Fixture) cho module Security.
/// Mỗi bài kiểm thử sẽ tạo một cơ sở dữ liệu In-Memory riêng biệt để không ảnh hưởng lẫn nhau.
/// </summary>
public sealed class SecurityTestContext : IDisposable
{
    private readonly ServiceProvider _serviceProvider;

    /// <summary>
    /// Cơ sở dữ liệu giả lập trên RAM dành riêng cho bài kiểm thử hiện tại.
    /// </summary>
    public SecurityDbContext DbContext { get; }

    /// <summary>
    /// Dịch vụ sinh và kiểm tra chữ ký JWT Token.
    /// </summary>
    public JwtTokenService JwtTokenService { get; }

    /// <summary>
    /// Dịch vụ xử lý nghiệp vụ Đăng ký, Đăng nhập, Đổi mật khẩu và Quản lý người dùng.
    /// </summary>
    public AuthService AuthService { get; }

    public SecurityTestContext()
    {
        var services = new ServiceCollection();

        // Đăng ký hạ tầng EventBus dùng chung để AuthService có thể phát sự kiện Audit Log
        services.AddSharedInfrastructure();

        // Tạo tên DB ngẫu nhiên (Guid) giúp các kịch bản kiểm thử chạy song song không đụng dữ liệu của nhau
        var uniqueDbName = $"HigenSecurityTestDb_{Guid.NewGuid()}";
        services.AddDbContext<SecurityDbContext>(options =>
            options.UseInMemoryDatabase(uniqueDbName));

        // Cấu hình JWT giả lập chuẩn cho môi trường test
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SecretKey"] = "HIGEN_ABSA_TEST_SECRET_KEY_MUST_BE_AT_LEAST_32_BYTES_LONG_2026",
                ["Jwt:Issuer"] = "HigenAbsaApi",
                ["Jwt:Audience"] = "HigenAbsaApp",
                ["Jwt:AccessTokenExpirationMinutes"] = "60",
                ["Jwt:RefreshTokenExpirationDays"] = "7"
            })
            .Build();

        services.AddSingleton(configuration);
        services.AddSingleton<JwtTokenService>();
        services.AddSingleton<IJwtTokenService>(sp => sp.GetRequiredService<JwtTokenService>());
        services.AddScoped<AuthService>();

        _serviceProvider = services.BuildServiceProvider();

        DbContext = _serviceProvider.GetRequiredService<SecurityDbContext>();
        JwtTokenService = _serviceProvider.GetRequiredService<JwtTokenService>();
        AuthService = _serviceProvider.GetRequiredService<AuthService>();
    }

    public void Dispose()
    {
        DbContext.Dispose();
        _serviceProvider.Dispose();
    }
}

