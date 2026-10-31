using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Modules.Security.Application.DTOs;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    public string Password { get; set; } = "";

    [Required, MinLength(2)]
    public string FullName { get; set; } = "";

    public string? PhoneNumber { get; set; }

    public string Role { get; set; } = "STORE_MANAGER";
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = "";
}

public class AuthResponse
{
    public string AccessToken { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresInSeconds { get; set; } = 3600;
    public UserProfileDto User { get; set; } = new();
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class UserListDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
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

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = "";

    [Required, MinLength(6, ErrorMessage = "New password must be at least 6 characters long")]
    public string NewPassword { get; set; } = "";
}

