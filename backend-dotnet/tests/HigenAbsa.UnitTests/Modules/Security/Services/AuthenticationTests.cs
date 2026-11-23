using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Security.Application.DTOs;
using HigenAbsa.UnitTests.Modules.Security.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Security.Services;

/// <summary>
/// Bộ kịch bản kiểm thử luồng Xác thực & Quản lý phiên (Đăng ký, Đăng nhập, Refresh Token, Đăng xuất).
/// Tuân thủ cấu trúc AAA (Arrange - Act - Assert) của Microsoft và tiêu chuẩn bảo mật OWASP WSTG v4.2 (Mục 4.4).
/// </summary>
public class AuthenticationTests
{
    [Fact]
    public async Task RegisterAsync_ValidNewUser_CreatesAccountWithHashedPasswordAndTokens()
    {
        // 1. Arrange (Chuẩn bị): Tạo thông tin đăng ký hợp lệ có khoảng trắng và chữ hoa để kiểm tra chuẩn hóa
        using var context = new SecurityTestContext();
        var request = new RegisterRequest
        {
            Email = "  ShopOwner@Higen.vn ",
            Password = "Password@123",
            FullName = "  Nguyễn Văn Chủ Shop  ",
            PhoneNumber = " 0901234567 "
        };

        // 2. Act (Thực thi): Gọi hàm đăng ký tài khoản mới
        var response = await context.AuthService.RegisterAsync(request, "127.0.0.1");

        // 3. Assert (Kiểm chứng): Tài khoản được chuẩn hóa dữ liệu, băm mật khẩu BCrypt và cấp đủ Token
        Assert.NotNull(response);
        Assert.False(string.IsNullOrWhiteSpace(response.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(response.RefreshToken));
        Assert.Equal("Bearer", response.TokenType);
        Assert.Equal("shopowner@higen.vn", response.User.Email);
        Assert.Equal("Nguyễn Văn Chủ Shop", response.User.FullName);
        Assert.Equal("STORE_MANAGER", response.User.Role);
        Assert.True(response.User.IsActive);

        var savedUser = await context.DbContext.SystemUsers.FirstOrDefaultAsync(u => u.Email == "shopowner@higen.vn");
        Assert.NotNull(savedUser);
        Assert.NotEqual("Password@123", savedUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password@123", savedUser.PasswordHash));
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmailDifferentCase_ThrowsInvalidOperationException()
    {
        // 1. Arrange (Chuẩn bị): Đăng ký sẵn một tài khoản với email chữ hoa-thường lẫn lộn
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "User@Shop.vn",
            Password = "Password@123",
            FullName = "Người Dùng Một"
        }, "127.0.0.1");

        var duplicateRequest = new RegisterRequest
        {
            Email = "user@shop.vn",
            Password = "OtherPassword@456",
            FullName = "Người Dùng Hai"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Đăng ký lại cùng email phải bị từ chối
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.AuthService.RegisterAsync(duplicateRequest, "127.0.0.1"));

        Assert.Equal("Email address is already registered.", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAccessAndRefreshTokens()
    {
        // 1. Arrange (Chuẩn bị): Tạo sẵn tài khoản hợp lệ trong hệ thống
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "tester@higen.vn",
            Password = "Secret@123",
            FullName = "Tester Nội Bộ"
        }, "127.0.0.1");

        var loginRequest = new LoginRequest
        {
            Email = "  TESTER@Higen.vn ",
            Password = "Secret@123"
        };

        // 2. Act (Thực thi): Đăng nhập từ địa chỉ IP 192.168.1.50
        var response = await context.AuthService.LoginAsync(loginRequest, "192.168.1.50");

        // 3. Assert (Kiểm chứng): Trả về cặp token mới và lưu vết Refresh Token kèm IP trong CSDL
        Assert.False(string.IsNullOrWhiteSpace(response.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(response.RefreshToken));
        Assert.Equal("Bearer", response.TokenType);
        Assert.Equal(3600, response.ExpiresInSeconds);
        Assert.Equal("tester@higen.vn", response.User.Email);

        var storedRefreshToken = await context.DbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == response.RefreshToken);
        Assert.NotNull(storedRefreshToken);
        Assert.Equal("192.168.1.50", storedRefreshToken.CreatedByIp);
        Assert.False(storedRefreshToken.IsRevoked);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedWithGenericMessage()
    {
        // 1. Arrange (Chuẩn bị): Tài khoản tồn tại nhưng nhập sai mật khẩu (OWASP WSTG-ATHN-02 / Chống dò tài khoản)
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "victim@higen.vn",
            Password = "CorrectPassword@123",
            FullName = "Tài Khoản Thử"
        }, "127.0.0.1");

        var wrongPasswordLogin = new LoginRequest
        {
            Email = "victim@higen.vn",
            Password = "WrongPassword@999"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Báo lỗi chung chung để kẻ tấn công không biết email có tồn tại hay không
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(wrongPasswordLogin, "127.0.0.1"));

        Assert.Equal("Invalid email or password.", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_NonExistentEmail_ThrowsUnauthorizedWithSameGenericMessage()
    {
        // 1. Arrange (Chuẩn bị): Đăng nhập bằng email chưa từng tồn tại (Chống Account Enumeration)
        using var context = new SecurityTestContext();
        var unknownLogin = new LoginRequest
        {
            Email = "notfound@higen.vn",
            Password = "AnyPassword@123"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Thông báo lỗi phải giống hệt trường hợp sai mật khẩu
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(unknownLogin, "127.0.0.1"));

        Assert.Equal("Invalid email or password.", exception.Message);
    }

    [Fact]
    public async Task LoginAsync_DeactivatedAccount_ThrowsUnauthorizedAccessException()
    {
        // 1. Arrange (Chuẩn bị): Tài khoản đã bị vô hiệu hóa (OWASP WSTG-ATHN-03 / Account Lockout)
        using var context = new SecurityTestContext();
        var registered = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "locked@higen.vn",
            Password = "Password@123",
            FullName = "Tài Khoản Bị Khóa"
        }, "127.0.0.1");

        var userInDb = await context.DbContext.SystemUsers.FindAsync(registered.User.Id);
        Assert.NotNull(userInDb);
        userInDb.IsActive = false;
        await context.DbContext.SaveChangesAsync();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Dù nhập đúng mật khẩu vẫn không được phép đăng nhập
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(new LoginRequest
            {
                Email = "locked@higen.vn",
                Password = "Password@123"
            }, "127.0.0.1"));

        Assert.Equal("Account is deactivated. Contact administrator.", exception.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidActiveToken_RotatesTokenAndRevokesOldToken()
    {
        // 1. Arrange (Chuẩn bị): Đăng ký người dùng để lấy Refresh Token ban đầu
        using var context = new SecurityTestContext();
        var initialAuth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "rotate@higen.vn",
            Password = "Password@123",
            FullName = "Người Dùng Xoay Vòng"
        }, "10.0.0.1");

        // 2. Act (Thực thi): Gửi Refresh Token hiện tại để xin cặp Token mới (Token Rotation)
        var rotatedAuth = await context.AuthService.RefreshTokenAsync(initialAuth.RefreshToken, "10.0.0.2");

        // 3. Assert (Kiểm chứng): Token cũ phải bị thu hồi ngay và trỏ sang Token mới
        Assert.False(string.IsNullOrWhiteSpace(rotatedAuth.AccessToken));
        Assert.NotEqual(initialAuth.RefreshToken, rotatedAuth.RefreshToken);

        var oldTokenInDb = await context.DbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == initialAuth.RefreshToken);
        var newTokenInDb = await context.DbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == rotatedAuth.RefreshToken);

        Assert.NotNull(oldTokenInDb);
        Assert.True(oldTokenInDb.IsRevoked);
        Assert.Equal("10.0.0.2", oldTokenInDb.RevokedByIp);
        Assert.Equal(rotatedAuth.RefreshToken, oldTokenInDb.ReplacedByToken);

        Assert.NotNull(newTokenInDb);
        Assert.False(newTokenInDb.IsRevoked);
    }

    [Fact]
    public async Task RefreshTokenAsync_AlreadyRevokedToken_ThrowsUnauthorizedAccessException()
    {
        // 1. Arrange (Chuẩn bị): Xoay vòng token 1 lần để token cũ chuyển sang trạng thái đã thu hồi
        using var context = new SecurityTestContext();
        var initialAuth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "reuse@higen.vn",
            Password = "Password@123",
            FullName = "Kiểm Tra Tái Sử Dụng"
        }, "10.0.0.1");

        await context.AuthService.RefreshTokenAsync(initialAuth.RefreshToken, "10.0.0.2");

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Cố tình dùng lại token cũ phải bị chặn với UnauthorizedAccessException
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.RefreshTokenAsync(initialAuth.RefreshToken, "10.0.0.99"));

        Assert.Equal("Invalid or expired refresh token.", exception.Message);
    }

    [Fact]
    public async Task LogoutAsync_ExistingRefreshToken_MarksTokenAsRevoked()
    {
        // 1. Arrange (Chuẩn bị): Người dùng đã đăng nhập và đang giữ Refresh Token hợp lệ
        using var context = new SecurityTestContext();
        var auth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "logout@higen.vn",
            Password = "Password@123",
            FullName = "Người Dùng Đăng Xuất"
        }, "127.0.0.1");

        // 2. Act (Thực thi): Gọi đăng xuất với Refresh Token đang dùng
        var result = await context.AuthService.LogoutAsync(auth.RefreshToken, "172.16.0.5");

        // 3. Assert (Kiểm chứng): Trả về true và đánh dấu thu hồi token kèm thời điểm + IP đăng xuất
        Assert.True(result);

        var revokedToken = await context.DbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == auth.RefreshToken);
        Assert.NotNull(revokedToken);
        Assert.True(revokedToken.IsRevoked);
        Assert.NotNull(revokedToken.RevokedAt);
        Assert.Equal("172.16.0.5", revokedToken.RevokedByIp);
    }

    [Fact]
    public async Task RegisterAsync_ClientSuppliesAdminRole_EnforcesDefaultStoreManagerAndPreventsPrivilegeEscalation()
    {
        // [TC-BE-SEC-16] Chuẩn ISO/IEC 25010:2023 (Security - Integrity) & OWASP WSTG-ATHZ-02 (Privilege Escalation)
        // 1. Arrange (Chuẩn bị): Người dùng bên ngoài cố tình truyền Role = "ADMIN" vào payload đăng ký công khai
        using var context = new SecurityTestContext();
        var maliciousRequest = new RegisterRequest
        {
            Email = "attacker@higen.vn",
            Password = "Password@123",
            FullName = "Kẻ Tấn Công Leo Thang Đặc Quyền",
            Role = "ADMIN"
        };

        // 2. Act (Thực thi): Gọi hàm đăng ký công khai
        var response = await context.AuthService.RegisterAsync(maliciousRequest, "127.0.0.1");

        // 3. Assert (Kiểm chứng): Hệ thống bắt buộc gán quyền mặc định STORE_MANAGER, không cho phép tự phong ADMIN
        Assert.Equal("STORE_MANAGER", response.User.Role);
        var savedUser = await context.DbContext.SystemUsers.FirstAsync(u => u.Email == "attacker@higen.vn");
        Assert.Equal("STORE_MANAGER", savedUser.Role);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmailWithSurroundingWhitespace_ThrowsInvalidOperationException()
    {
        // [TC-BE-SEC-17] Chuẩn ISO/IEC/IEEE 29119-4 (Boundary / Input Normalization)
        // 1. Arrange (Chuẩn bị): Đăng ký sẵn tài khoản chuẩn đã được Trim()
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "clean@shop.vn",
            Password = "Password@123",
            FullName = "Tài Khoản Gốc"
        }, "127.0.0.1");

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Đăng ký lại cùng email nhưng thêm khoảng trắng ở đầu/cuối phải bị chặn
        var duplicateWithSpaces = new RegisterRequest
        {
            Email = "   CLEAN@shop.vn   ",
            Password = "Password@456",
            FullName = "Tài Khoản Trùng Lặp Có Dấu Cách"
        };

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.AuthService.RegisterAsync(duplicateWithSpaces, "127.0.0.1"));

        Assert.Equal("Email address is already registered.", exception.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_ReusingRevokedToken_RevokesDescendantActiveTokensForUser()
    {
        // [TC-BE-SEC-18] Chuẩn IETF OAuth 2.0 Security BCP (Refresh Token Replay Detection) & ISO 25010 (Resistance)
        // 1. Arrange (Chuẩn bị): Người dùng đăng nhập rồi xoay vòng sang token mới (token cũ đã bị thu hồi)
        using var context = new SecurityTestContext();
        var initialAuth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "tokenfamily@higen.vn",
            Password = "Password@123",
            FullName = "Kiểm Tra Chuỗi Token"
        }, "10.0.0.1");

        var rotatedAuth = await context.AuthService.RefreshTokenAsync(initialAuth.RefreshToken, "10.0.0.2");

        // 2. Act (Thực thi): Kẻ tấn công đem RefreshToken cũ (đã bị thu hồi) ra tái sử dụng
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.RefreshTokenAsync(initialAuth.RefreshToken, "10.0.0.99"));

        // 3. Assert (Kiểm chứng): Toàn bộ RefreshToken đang hoạt động trong gia đình token của user đó phải bị thu hồi khẩn cấp
        var descendantToken = await context.DbContext.RefreshTokens
            .FirstAsync(t => t.Token == rotatedAuth.RefreshToken);
        Assert.True(descendantToken.IsRevoked);
    }

    [Fact]
    public async Task RegisterAsync_PasswordShorterThanMinimumBoundary_ThrowsArgumentOrInvalidOperationException()
    {
        // [TC-BE-SEC-19] Chuẩn ISO/IEC/IEEE 29119-4 (Boundary Value Analysis: độ dài mật khẩu = 5 < ngưỡng tối thiểu 6)
        // 1. Arrange (Chuẩn bị): Tạo yêu cầu đăng ký với mật khẩu 5 ký tự (sát dưới biên 6 ký tự)
        using var context = new SecurityTestContext();
        var weakPasswordRequest = new RegisterRequest
        {
            Email = "boundary5@higen.vn",
            Password = "12345",
            FullName = "Kiểm Thử Giá Trị Biên Mật Khẩu"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Tầng dịch vụ phải từ chối mật khẩu dưới 6 ký tự
        await Assert.ThrowsAnyAsync<Exception>(() =>
            context.AuthService.RegisterAsync(weakPasswordRequest, "127.0.0.1"));
    }
}

