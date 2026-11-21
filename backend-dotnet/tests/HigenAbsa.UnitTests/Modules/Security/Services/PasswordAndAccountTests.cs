using HigenAbsa.Modules.Security.Application.DTOs;
using HigenAbsa.UnitTests.Modules.Security.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Security.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Đổi mật khẩu và Quản lý tài khoản (RBAC / Soft Delete / Tìm kiếm).
/// Tham chiếu tiêu chuẩn OWASP WSTG-ATHN-09 (Testing for Weak Password Change Functionalities).
/// </summary>
public class PasswordAndAccountTests
{
    [Fact]
    public async Task ChangePasswordAsync_CorrectCurrentPassword_UpdatesPasswordHash()
    {
        // 1. Arrange (Chuẩn bị): Tạo tài khoản với mật khẩu ban đầu
        using var context = new SecurityTestContext();
        var auth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "changepass@higen.vn",
            Password = "OldPassword@123",
            FullName = "Nhân Viên Đổi Mật Khẩu"
        }, "127.0.0.1");

        // 2. Act (Thực thi): Đổi mật khẩu khi nhập đúng mật khẩu hiện tại
        var changed = await context.AuthService.ChangePasswordAsync(
            auth.User.Id,
            "OldPassword@123",
            "NewPassword@456");

        // 3. Assert (Kiểm chứng): Đổi thành công, mật khẩu cũ không đăng nhập được nữa và mật khẩu mới đăng nhập thành công
        Assert.True(changed);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(new LoginRequest
            {
                Email = "changepass@higen.vn",
                Password = "OldPassword@123"
            }, "127.0.0.1"));

        var newLogin = await context.AuthService.LoginAsync(new LoginRequest
        {
            Email = "changepass@higen.vn",
            Password = "NewPassword@456"
        }, "127.0.0.1");
        Assert.Equal(auth.User.Id, newLogin.User.Id);
    }

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ThrowsUnauthorizedAccessException()
    {
        // 1. Arrange (Chuẩn bị): Tạo tài khoản và lưu lại chuỗi băm mật khẩu ban đầu
        using var context = new SecurityTestContext();
        var auth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "wrongcurrent@higen.vn",
            Password = "OriginalPassword@123",
            FullName = "Người Dùng Kiểm Tra"
        }, "127.0.0.1");

        var userBefore = await context.DbContext.SystemUsers.FindAsync(auth.User.Id);
        Assert.NotNull(userBefore);
        var originalHash = userBefore.PasswordHash;

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Nhập sai mật khẩu cũ phải báo lỗi và giữ nguyên mật khẩu cũ
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.ChangePasswordAsync(
                auth.User.Id,
                "WrongOldPassword!",
                "NewPassword@456"));

        Assert.Equal("Current password is incorrect.", exception.Message);

        var userAfter = await context.DbContext.SystemUsers.FindAsync(auth.User.Id);
        Assert.NotNull(userAfter);
        Assert.Equal(originalHash, userAfter.PasswordHash);
    }

    [Fact]
    public async Task DeleteUserAsync_ExistingUser_SoftDeletesByDeactivatingAccount()
    {
        // 1. Arrange (Chuẩn bị): Tạo tài khoản nhân viên CSKH
        using var context = new SecurityTestContext();
        var createdUser = await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "staff@higen.vn",
            Password = "Password@123",
            FullName = "Nhân Viên Nghỉ Việc",
            Role = "CSKH_STAFF"
        });

        // 2. Act (Thực thi): Thực hiện xóa tài khoản
        var deleted = await context.AuthService.DeleteUserAsync(createdUser.Id);

        // 3. Assert (Kiểm chứng): Tài khoản vẫn được giữ lại trong DB để truy vết (Soft Delete), trạng thái bị khóa và không thể đăng nhập
        Assert.True(deleted);

        var userInDb = await context.DbContext.SystemUsers.FindAsync(createdUser.Id);
        Assert.NotNull(userInDb);
        Assert.False(userInDb.IsActive);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(new LoginRequest
            {
                Email = "staff@higen.vn",
                Password = "Password@123"
            }, "127.0.0.1"));
    }

    [Fact]
    public async Task GetUsersAsync_FilterByRoleAndSearch_ReturnsMatchingPagedUsers()
    {
        // 1. Arrange (Chuẩn bị): Tạo 3 tài khoản với 3 vai trò khác nhau (ADMIN, STORE_MANAGER, CSKH_STAFF)
        using var context = new SecurityTestContext();
        await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "an.admin@higen.vn",
            Password = "Password@123",
            FullName = "An Quản Trị",
            Role = "ADMIN"
        });
        await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "binh.manager@higen.vn",
            Password = "Password@123",
            FullName = "Bình Quản Lý",
            Role = "STORE_MANAGER"
        });
        await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "chi.cskh@higen.vn",
            Password = "Password@123",
            FullName = "Chi Chăm Sóc Khách Hàng",
            Role = "CSKH_STAFF"
        });

        // 2. Act (Thực thi): Lọc theo vai trò CSKH_STAFF và tìm kiếm theo từ khóa tên
        var cskhOnly = await context.AuthService.GetUsersAsync(page: 1, pageSize: 20, role: "CSKH_STAFF", search: null);
        var searchByName = await context.AuthService.GetUsersAsync(page: 1, pageSize: 20, role: null, search: "Bình");

        // 3. Assert (Kiểm chứng): Kết quả lọc và phân trang trả về chính xác từng tài khoản
        Assert.Equal(1, cskhOnly.TotalCount);
        Assert.Single(cskhOnly.Items);
        Assert.Equal("chi.cskh@higen.vn", cskhOnly.Items[0].Email);

        Assert.Equal(1, searchByName.TotalCount);
        Assert.Single(searchByName.Items);
        Assert.Equal("binh.manager@higen.vn", searchByName.Items[0].Email);
    }
}

