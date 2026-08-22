// Models/Auth/UserDtos.cs - DTOs for User Management (Admin CRUD + Self-service)
using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Api.Models.Auth;

// -----------------------------------------------------------------------
// Admin User Management
// -----------------------------------------------------------------------

public class UserListDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    public string Password { get; set; } = "";

    [Required, MinLength(2)]
    public string FullName { get; set; } = "";

    public string? PhoneNumber { get; set; }

    [Required, RegularExpression("^(ADMIN|STORE_MANAGER|CSKH_STAFF)$",
        ErrorMessage = "Role must be ADMIN, STORE_MANAGER, or CSKH_STAFF")]
    public string Role { get; set; } = "STORE_MANAGER";
}

public class UpdateUserRequest
{
    [MinLength(2)]
    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    [RegularExpression("^(ADMIN|STORE_MANAGER|CSKH_STAFF)$",
        ErrorMessage = "Role must be ADMIN, STORE_MANAGER, or CSKH_STAFF")]
    public string? Role { get; set; }

    public bool? IsActive { get; set; }
}

// -----------------------------------------------------------------------
// Self-service Change Password
// -----------------------------------------------------------------------

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = "";

    [Required, MinLength(6, ErrorMessage = "New password must be at least 6 characters long")]
    public string NewPassword { get; set; } = "";
}
