// Models/Customer/CustomerDtos.cs - DTOs for Customer Management
using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Api.Models.Customer;

public class CustomerDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = "";
    public string PlatformUserId { get; set; } = "";
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public int TotalReviewsCount { get; set; }
    public string RiskLevel { get; set; } = "NORMAL";
    public DateTime CreatedAt { get; set; }
}

public class CustomerDetailDto : CustomerDto
{
    public double AverageRating { get; set; }
    public int PosCount { get; set; }
    public int NeuCount { get; set; }
    public int NegCount { get; set; }
}

public class UpdateRiskLevelRequest
{
    [Required, RegularExpression("^(NORMAL|POTENTIAL_BOMMER|VIP)$",
        ErrorMessage = "RiskLevel must be NORMAL, POTENTIAL_BOMMER, or VIP")]
    public string RiskLevel { get; set; } = "";
}
