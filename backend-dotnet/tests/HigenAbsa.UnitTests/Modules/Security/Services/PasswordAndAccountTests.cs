using Microsoft.AspNetCore.Authorization;
using HigenAbsa.Modules.Security.Application.Contracts;
using HigenAbsa.Modules.Security.Application.DTOs;
using HigenAbsa.Modules.Security.Endpoints;
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

    [Fact]
    public async Task CreateUserAsync_ValidAdminRequest_NormalizesEmailTrimsNameAndHashesPassword()
    {
        // [TC-BE-SEC-21] Chuẩn ISO 25010:2023 (Security & Data Integrity)
        // 1. Arrange (Chuẩn bị): Admin tạo tài khoản nhân viên CSKH có email chữ hoa và khoảng trắng
        using var context = new SecurityTestContext();

        // 2. Act (Thực thi): Gọi CreateUserAsync
        var created = await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "  Staff.New@Higen.vn  ",
            Password = "Password@123",
            FullName = "  Nguyễn Minh Tâm  ",
            PhoneNumber = " 0901234567 ",
            Role = "cskh_staff"
        });

        // 3. Assert (Kiểm chứng): Chuẩn hóa email thường, Trim tên/SĐT, viết hoa vai trò và băm mật khẩu BCrypt
        Assert.Equal("staff.new@higen.vn", created.Email);
        Assert.Equal("Nguyễn Minh Tâm", created.FullName);
        Assert.Equal("0901234567", created.PhoneNumber);
        Assert.Equal("CSKH_STAFF", created.Role);
        Assert.True(created.IsActive);

        var dbUser = await context.DbContext.SystemUsers.FindAsync(created.Id);
        Assert.NotNull(dbUser);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password@123", dbUser.PasswordHash));
    }

    [Fact]
    public async Task CreateUserAsync_DuplicateEmailDifferentCase_ThrowsInvalidOperationException()
    {
        // [TC-BE-SEC-22] Chuẩn ISO 29119-4 (Equivalence Partitioning - Chặn tạo trùng email nội bộ)
        // 1. Arrange (Chuẩn bị): Tạo sẵn tài khoản nhân viên
        using var context = new SecurityTestContext();
        await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "dup.staff@higen.vn",
            Password = "Password@123",
            FullName = "Nhân Viên 1",
            Role = "CSKH_STAFF"
        });

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Tạo tài khoản thứ 2 trùng email khác hoa/thường phải bị từ chối
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.AuthService.CreateUserAsync(new CreateUserRequest
            {
                Email = "  DUP.STAFF@higen.vn ",
                Password = "Password@456",
                FullName = "Nhân Viên 2",
                Role = "STORE_MANAGER"
            }));
    }

    [Fact]
    public async Task UpdateUserAsync_RoleChangeAndDeactivation_PersistsAndBlocksSubsequentLogin()
    {
        // [TC-BE-SEC-23] Chuẩn ISO 29119-4 (State Transition - Cập nhật vai trò và vô hiệu hóa tài khoản)
        // 1. Arrange (Chuẩn bị): Tạo nhân viên CSKH_STAFF đang hoạt động
        using var context = new SecurityTestContext();
        var user = await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "update.staff@higen.vn",
            Password = "Password@123",
            FullName = "Trần Hạnh",
            Role = "CSKH_STAFF"
        });

        // 2. Act (Thực thi): Nâng quyền lên STORE_MANAGER và khóa tài khoản IsActive = false
        var updated = await context.AuthService.UpdateUserAsync(user.Id, new UpdateUserRequest
        {
            FullName = "  Trần Hạnh (Đã khóa)  ",
            Role = "store_manager",
            IsActive = false
        });

        // 3. Assert (Kiểm chứng): Thông tin cập nhật khớp DB và bị chặn đăng nhập ngay lập tức
        Assert.NotNull(updated);
        Assert.Equal("Trần Hạnh (Đã khóa)", updated.FullName);
        Assert.Equal("STORE_MANAGER", updated.Role);
        Assert.False(updated.IsActive);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(new LoginRequest
            {
                Email = "update.staff@higen.vn",
                Password = "Password@123"
            }, "127.0.0.1"));
    }

    [Fact]
    public async Task UpdateUserAsync_NonExistentUserId_ReturnsNull()
    {
        // [TC-BE-SEC-24] Chuẩn ISO 25010:2023 (Fault Tolerance - Trả về null an toàn khi ID không tồn tại)
        // 1. Arrange (Chuẩn bị): Khởi tạo SecurityTestContext
        using var context = new SecurityTestContext();

        // 2. Act (Thực thi): Gọi UpdateUserAsync với Guid ngẫu nhiên
        var result = await context.AuthService.UpdateUserAsync(Guid.NewGuid(), new UpdateUserRequest
        {
            FullName = "Ghost User"
        });

        // 3. Assert (Kiểm chứng): Trả về null không ném lỗi hệ thống
        Assert.Null(result);
    }

    [Fact]
    public async Task SecurityUserLookupContract_GetByIdAndEmail_ReturnsExactUserContractOrNull()
    {
        // [TC-BE-SEC-25] Chuẩn ISO 25010:2023 (Modularity - Hợp đồng IUserLookupContract liên phân hệ)
        // 1. Arrange (Chuẩn bị): Tạo tài khoản thật và khởi tạo SecurityUserLookupService
        using var context = new SecurityTestContext();
        var user = await context.AuthService.CreateUserAsync(new CreateUserRequest
        {
            Email = "contract@higen.vn",
            Password = "Password@123",
            FullName = "Contract User",
            Role = "ADMIN"
        });
        var lookup = new SecurityUserLookupService(context.DbContext);

        // 2. Act (Thực thi): Tra cứu theo ID, Email khác chữ hoa và ID không tồn tại
        var byId = await lookup.GetByIdAsync(user.Id);
        var byEmail = await lookup.GetByEmailAsync("CONTRACT@HIGEN.VN");
        var missing = await lookup.GetByIdAsync(Guid.NewGuid());

        // 3. Assert (Kiểm chứng): Trả về đúng UserContractDto cho bản ghi thật và null cho ID ma
        Assert.NotNull(byId);
        Assert.Equal("Contract User", byId.FullName);
        Assert.Equal("ADMIN", byId.Role);
        Assert.NotNull(byEmail);
        Assert.Equal(user.Id, byEmail.UserId);
        Assert.Null(missing);
    }

    [Fact]
    public async Task GetProfileAsync_ExistingAndMissingUser_ReturnsProfileOrNull()
    {
        // [TC-BE-SEC-26] Chuẩn ISO 25010:2023 (Functional Appropriateness - Truy xuất hồ sơ cá nhân)
        // 1. Arrange (Chuẩn bị): Đăng ký một tài khoản mới
        using var context = new SecurityTestContext();
        var auth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "profile@higen.vn",
            Password = "Password@123",
            FullName = "Hồ Sơ Người Dùng"
        }, "127.0.0.1");

        // 2. Act (Thực thi): Lấy profile thật và ID không tồn tại
        var found = await context.AuthService.GetProfileAsync(auth.User.Id);
        var notFound = await context.AuthService.GetUserByIdAsync(Guid.NewGuid());

        // 3. Assert (Kiểm chứng): Khớp thông tin tài khoản và null khi không tồn tại
        Assert.NotNull(found);
        Assert.Equal("profile@higen.vn", found.Email);
        Assert.Equal("Hồ Sơ Người Dùng", found.FullName);
        Assert.Null(notFound);
    }

    [Fact]
    public async Task ChangePasswordAsync_SameAsCurrentPassword_ThrowsArgumentOrInvalidOperationException()
    {
        // [TC-BE-SEC-27] Chuẩn ISO 25010:2023 / NIST 800-63B (Password Hygiene - Cấm đổi trùng mật khẩu cũ · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tài khoản đang dùng mật khẩu "Password@123"
        using var context = new SecurityTestContext();
        var auth = await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "reusepass@higen.vn",
            Password = "Password@123",
            FullName = "Chính Sách Mật Khẩu"
        }, "127.0.0.1");

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Đổi sang mật khẩu mới giống hệt mật khẩu cũ phải bị từ chối
        await Assert.ThrowsAnyAsync<Exception>(() =>
            context.AuthService.ChangePasswordAsync(auth.User.Id, "Password@123", "Password@123"));
    }

    [Fact]
    public async Task CreateUserAsync_UnsupportedRoleValue_ThrowsArgumentException()
    {
        // [TC-BE-SEC-28] Chuẩn ISO 25010:2023 (Security Authorization - Chặn gán Role lạ ngoài danh mục RBAC · ISO TDD)
        // 1. Arrange (Chuẩn bị): Yêu cầu tạo người dùng với Role rác "SUPER_ROOT_HACKER"
        using var context = new SecurityTestContext();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Hệ thống chỉ được phép nhận ADMIN / STORE_MANAGER / CSKH_STAFF
        await Assert.ThrowsAnyAsync<ArgumentException>(() =>
            context.AuthService.CreateUserAsync(new CreateUserRequest
            {
                Email = "alien.role@higen.vn",
                Password = "Password@123",
                FullName = "Invalid Role User",
                Role = "SUPER_ROOT_HACKER"
            }));
    }

    [Fact]
    public async Task GetUsersAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds()
    {
        // [TC-BE-SEC-29] Chuẩn OWASP API4:2023 (Unrestricted Resource Consumption - Chống DDoS phân trang & biên âm · ISO TDD)
        // 1. Arrange (Chuẩn bị): Đăng ký 2 tài khoản hợp lệ trên RAM
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest { Email = "u1@higen.vn", Password = "Password@123", FullName = "User 1" }, "127.0.0.1");
        await context.AuthService.RegisterAsync(new RegisterRequest { Email = "u2@higen.vn", Password = "Password@123", FullName = "User 2" }, "127.0.0.1");

        // 2. Act (Thực thi): Gửi tham số biên âm page=-2 và pageSize=50000 nhằm gây cạn kiệt bộ nhớ (DDoS)
        var result = await context.AuthService.GetUsersAsync(page: -2, pageSize: 50000, role: null, search: null);

        // 3. Assert (Kiểm chứng): Hệ thống phải kẹp biên an toàn Page >= 1 và PageSize <= 100
        Assert.InRange(result.Page, 1, int.MaxValue);
        Assert.InRange(result.PageSize, 1, 100);
    }

    [Fact]
    public void UserAndAuthControllers_ProtectedEndpoints_EnforceAuthorizeAndAdminRoleAttributes()
    {
        // [TC-BE-SEC-30] Chuẩn OWASP API5:2023 (Broken Function Level Authorization - Kiểm tra RBAC Controller)
        // 1. Arrange (Chuẩn bị): Đọc metadata phân quyền trên UserController và AuthController
        var userCtrlAuth = Attribute.GetCustomAttribute(typeof(UserController), typeof(AuthorizeAttribute)) as AuthorizeAttribute;
        var logoutMethod = typeof(AuthController).GetMethod(nameof(AuthController.Logout));
        var changePwdMethod = typeof(AuthController).GetMethod(nameof(AuthController.ChangePassword));

        // 2 & 3. Act & Assert (Kiểm chứng): UserController phải khóa chặt Roles="ADMIN"; Logout & ChangePassword phải có [Authorize]
        Assert.NotNull(userCtrlAuth);
        Assert.Equal("ADMIN", userCtrlAuth.Roles);
        Assert.NotNull(logoutMethod);
        Assert.NotNull(Attribute.GetCustomAttribute(logoutMethod, typeof(AuthorizeAttribute)));
        Assert.NotNull(changePwdMethod);
        Assert.NotNull(Attribute.GetCustomAttribute(changePwdMethod, typeof(AuthorizeAttribute)));
    }

    [Fact]
    public async Task LoginAsync_RepeatedFailedAttempts_LocksOutAccountTemporarilyToPreventBruteForce()
    {
        // [TC-BE-SEC-31] Chuẩn OWASP WSTG-ATHN-03 (Brute-Force / DDoS Password Spray Protection · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tài khoản hợp lệ với mật khẩu "Strong@Password1"
        using var context = new SecurityTestContext();
        await context.AuthService.RegisterAsync(new RegisterRequest
        {
            Email = "brutetarget@higen.vn",
            Password = "Strong@Password1",
            FullName = "Target User"
        }, "127.0.0.1");

        // 2. Act (Thực thi): Thử sai mật khẩu liên tiếp 6 lần rồi thử đăng nhập bằng mật khẩu đúng
        for (int i = 0; i < 6; i++)
        {
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                context.AuthService.LoginAsync(new LoginRequest { Email = "brutetarget@higen.vn", Password = $"Wrong{i}!" }, "10.0.0.88"));
        }

        // 3. Assert (Kiểm chứng): Tài khoản phải tạm khóa sau ngưỡng thử sai liên tiếp, không cho qua ngay cả khi đúng mật khẩu
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            context.AuthService.LoginAsync(new LoginRequest { Email = "brutetarget@higen.vn", Password = "Strong@Password1" }, "10.0.0.88"));
    }

    [Fact]
    public async Task RegisterAsync_WeakNumericOnlyPasswordAtMinLength_RequiresCharacterComplexity()
    {
        // [TC-BE-SEC-32] Chuẩn OWASP ASVS V2.1 (Password Strength - Chặn mật khẩu 6 ký tự toàn số "123456" · ISO TDD)
        // 1. Arrange (Chuẩn bị): Yêu cầu đăng ký với mật khẩu yếu toàn chữ số
        using var context = new SecurityTestContext();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải yêu cầu độ phức tạp tối thiểu và ném ngoại lệ
        await Assert.ThrowsAnyAsync<Exception>(() =>
            context.AuthService.RegisterAsync(new RegisterRequest
            {
                Email = "weakpwd@higen.vn",
                Password = "123456",
                FullName = "Weak Password User"
            }, "127.0.0.1"));
    }
}

