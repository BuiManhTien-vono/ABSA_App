// Models/Product/ProductDtos.cs - DTOs for Product Management
namespace HigenAbsa.Api.Models.Product;

public class ProductDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = "";
    public string PlatformCode { get; set; } = "";
    public string PlatformProductId { get; set; } = "";
    public string? Sku { get; set; }
    public string Name { get; set; } = "";
    public string? ImageUrl { get; set; }
    public string? ProductUrl { get; set; }
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ReviewCount { get; set; }
    public double AverageRating { get; set; }
}

public class ProductDetailDto : ProductDto
{
    public int PosCount { get; set; }
    public int NeuCount { get; set; }
    public int NegCount { get; set; }
}

public class ProductSentimentSummaryDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public SentimentBreakdown Overall { get; set; } = new();
    public List<AspectSummaryItem> AspectBreakdown { get; set; } = [];
}

public class SentimentBreakdown
{
    public int PosCount { get; set; }
    public int NeuCount { get; set; }
    public int NegCount { get; set; }
    public double PosPercent { get; set; }
    public double NeuPercent { get; set; }
    public double NegPercent { get; set; }
}

public class AspectSummaryItem
{
    public string MacroCategory { get; set; } = "";
    public string MicroAspect { get; set; } = "";
    public int PosCount { get; set; }
    public int NeuCount { get; set; }
    public int NegCount { get; set; }
    public int TotalMentions { get; set; }
}
