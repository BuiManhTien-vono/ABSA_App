// Models/Dashboard/DashboardDtos.cs - DTOs for Dashboard & Reporting
namespace HigenAbsa.Api.Models.Dashboard;

public class DashboardKpiDto
{
    public int TotalReviews { get; set; }
    public int TodayReviews { get; set; }
    public double TodayChangePercent { get; set; }

    public double PosPercent { get; set; }
    public double NeuPercent { get; set; }
    public double NegPercent { get; set; }
    public double PosChangePercent { get; set; }

    public int TotalProducts { get; set; }
    public int ConnectedStores { get; set; }
    public int OpenTickets { get; set; }
}

public class SentimentTrendDto
{
    public string Date { get; set; } = "";
    public int PosCount { get; set; }
    public int NeuCount { get; set; }
    public int NegCount { get; set; }
    public int TotalCount { get; set; }
}

public class PlatformDistributionDto
{
    public string PlatformCode { get; set; } = "";
    public string PlatformName { get; set; } = "";
    public int ReviewCount { get; set; }
    public double Percentage { get; set; }
}

public class NegativeSpikeDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string? StoreName { get; set; }
    public int NegCount { get; set; }
    public int TotalReviews { get; set; }
    public double NegPercent { get; set; }
}

public class RecentReviewDto
{
    public Guid Id { get; set; }
    public string? CommentText { get; set; }
    public byte Rating { get; set; }
    public string? OverallSentiment { get; set; }
    public string? CustomerName { get; set; }
    public string? ProductName { get; set; }
    public string? StoreName { get; set; }
    public DateTime ReviewCreatedAt { get; set; }
}
