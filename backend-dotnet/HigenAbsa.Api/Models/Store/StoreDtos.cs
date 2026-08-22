// Models/Store/StoreDtos.cs - DTOs for Store Connection & Platform management
using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Api.Models.Store;

// -----------------------------------------------------------------------
// Response DTOs
// -----------------------------------------------------------------------

public class PlatformDto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string? ApiBaseUrl { get; set; }
    public bool IsActive { get; set; }
}

public class StoreConnectionDto
{
    public Guid Id { get; set; }
    public int PlatformId { get; set; }
    public string PlatformCode { get; set; } = "";
    public string PlatformName { get; set; } = "";
    public string StoreName { get; set; } = "";
    public string StoreCodeOnPlatform { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime? LastSyncedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ProductCount { get; set; }
    public int ReviewCount { get; set; }
}

// -----------------------------------------------------------------------
// Request DTOs
// -----------------------------------------------------------------------

public class CreateStoreRequest
{
    [Required]
    public int PlatformId { get; set; }

    [Required, MaxLength(200)]
    public string StoreName { get; set; } = "";

    [Required, MaxLength(100)]
    public string StoreCodeOnPlatform { get; set; } = "";

    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
}

public class UpdateStoreRequest
{
    [MaxLength(200)]
    public string? StoreName { get; set; }

    [MaxLength(100)]
    public string? StoreCodeOnPlatform { get; set; }

    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    
    [MaxLength(30)]
    public string? Status { get; set; }
}
