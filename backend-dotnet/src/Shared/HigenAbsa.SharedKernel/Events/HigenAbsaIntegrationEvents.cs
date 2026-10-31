namespace HigenAbsa.SharedKernel.Events;

/// <summary>
/// Phát ra khi một đánh giá mới được đồng bộ từ sàn TMĐT (Shopee, Lazada...).
/// Module Engagement lắng nghe để kích hoạt Rule tự động phản hồi.
/// Module Reporting lắng nghe để cập nhật số lượng đánh giá tổng quan.
/// </summary>
public sealed record ReviewCreatedIntegrationEvent(
    Guid ReviewId,
    Guid StoreId,
    int Rating,
    string ReviewText,
    DateTimeOffset ReviewCreatedAt) : IIntegrationEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Phát ra khi AI phân tích xong cảm xúc phân cấp cho đánh giá.
/// </summary>
public sealed record ReviewAnalyzedIntegrationEvent(
    Guid ReviewId,
    string OverallSentiment,
    float Confidence,
    string? RootCause,
    string? SuggestedResponse) : IIntegrationEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Phát ra khi phát hiện đánh giá tiêu cực (NEG).
/// Module Engagement lắng nghe để tự động mở Ticket CSKH xử lý khẩn cấp.
/// </summary>
public sealed record NegativeReviewDetectedIntegrationEvent(
    Guid ReviewId,
    Guid StoreId,
    string CustomerName,
    string CustomerPhone,
    string Title,
    string Description,
    string Priority) : IIntegrationEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Phát ra khi người dùng hệ thống đăng ký mới hoặc đăng nhập.
/// </summary>
public sealed record UserAuditIntegrationEvent(
    Guid? UserId,
    string Action,
    string EntityName,
    string? EntityId,
    string? Details,
    string? IpAddress) : IIntegrationEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

