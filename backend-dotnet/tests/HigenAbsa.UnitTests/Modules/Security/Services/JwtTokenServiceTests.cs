using System.IdentityModel.Tokens.Jwt;
using HigenAbsa.Modules.Security.Domain;
using HigenAbsa.UnitTests.Modules.Security.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Security.Services;

/// <summary>
/// Bộ kịch bản kiểm thử dịch vụ sinh và xác thực chữ ký JWT Token.
/// Đảm bảo thông tin danh tính, vai trò (Claims) khớp và phát hiện được Token bị sửa đổi trái phép.
/// </summary>
public class JwtTokenServiceTests
{
    [Fact]
    public void GenerateAccessToken_ValidUser_ContainsCorrectIdentityAndRoleClaims()
    {
        // 1. Arrange (Chuẩn bị): Khởi tạo đối tượng người dùng với vai trò ADMIN
        using var context = new SecurityTestContext();
        var userId = Guid.NewGuid();
        var user = new SystemUser
        {
            Id = userId,
            Email = "admin@higen.vn",
            FullName = "Quản Trị Viên",
            Role = "ADMIN",
            IsActive = true
        };

        // 2. Act (Thực thi): Sinh Access Token từ JwtTokenService
        var (accessToken, expiresInSeconds) = context.JwtTokenService.GenerateAccessToken(user);
        var parsedJwt = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);

        // 3. Assert (Kiểm chứng): Token có thời hạn 3600 giây, đúng Issuer/Audience và chứa đủ Claims danh tính + vai trò
        Assert.Equal(3600, expiresInSeconds);
        Assert.Equal("HigenAbsaApi", parsedJwt.Issuer);
        Assert.Contains("HigenAbsaApp", parsedJwt.Audiences);
        Assert.Contains(parsedJwt.Claims, c => c.Type == "nameid" && c.Value == userId.ToString());
        Assert.Contains(parsedJwt.Claims, c => c.Type == "email" && c.Value == "admin@higen.vn");
        Assert.Contains(parsedJwt.Claims, c => c.Type == "unique_name" && c.Value == "Quản Trị Viên");
        Assert.Contains(parsedJwt.Claims, c => c.Type == "role" && c.Value == "ADMIN");
    }

    [Fact]
    public void GeneratePrincipalFromExpiredToken_TamperedToken_ReturnsNull()
    {
        // 1. Arrange (Chuẩn bị): Sinh một Token hợp lệ rồi cố tình làm sai lệch chữ ký bảo mật (giả lập kẻ gian sửa Token)
        using var context = new SecurityTestContext();
        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = "user@higen.vn",
            FullName = "Người Dùng Hợp Lệ",
            Role = "STORE_MANAGER",
            IsActive = true
        };

        var (validToken, _) = context.JwtTokenService.GenerateAccessToken(user);
        var parts = validToken.Split('.');
        var tamperedSignature = parts[2].StartsWith('A') ? "B" + parts[2][1..] : "A" + parts[2][1..];
        var tamperedToken = $"{parts[0]}.{parts[1]}.{tamperedSignature}";

        // 2. Act (Thực thi): Đưa Token bị sửa chữ ký vào hàm kiểm tra
        var principal = context.JwtTokenService.GetPrincipalFromExpiredToken(tamperedToken);

        // 3. Assert (Kiểm chứng): Hệ thống từ chối xác thực và trả về null
        Assert.Null(principal);
    }
}

