-- =============================================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU CHUẨN CHO KIẾN TRÚC MODULAR MONOLITH
-- Dự án: HIGEN-ABSA (Hierarchical Insight Generation for E-commerce Natural Language)
-- Hệ quản trị CSDL: Microsoft SQL Server
-- =============================================================================

USE [HigenAbsaDb];
GO

-- 1. TẠO CÁC SCHEMA NẾU CHƯA CÓ
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'security') EXEC('CREATE SCHEMA security');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'coresync') EXEC('CREATE SCHEMA coresync');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'inference') EXEC('CREATE SCHEMA inference');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'engagement') EXEC('CREATE SCHEMA engagement');
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'reporting') EXEC('CREATE SCHEMA reporting');
GO

-- 2. DỌN DẸP BẢNG CŨ ĐỂ KHỞI TẠO CHUẨN NẾU ĐÃ TỒN TẠI
IF OBJECT_ID('engagement.Tickets', 'U') IS NOT NULL DROP TABLE engagement.Tickets;
IF OBJECT_ID('engagement.ReviewResponses', 'U') IS NOT NULL DROP TABLE engagement.ReviewResponses;
IF OBJECT_ID('engagement.AutomationRules', 'U') IS NOT NULL DROP TABLE engagement.AutomationRules;
IF OBJECT_ID('engagement.ResponseTemplates', 'U') IS NOT NULL DROP TABLE engagement.ResponseTemplates;

IF OBJECT_ID('reporting.DailyPlatformSummaries', 'U') IS NOT NULL DROP TABLE reporting.DailyPlatformSummaries;
IF OBJECT_ID('reporting.AuditLogs', 'U') IS NOT NULL DROP TABLE reporting.AuditLogs;

IF OBJECT_ID('inference.ReviewKeywords', 'U') IS NOT NULL DROP TABLE inference.ReviewKeywords;
IF OBJECT_ID('inference.ReviewAspects', 'U') IS NOT NULL DROP TABLE inference.ReviewAspects;
IF OBJECT_ID('inference.ReviewAIAnalysis', 'U') IS NOT NULL DROP TABLE inference.ReviewAIAnalysis;
IF OBJECT_ID('inference.ReviewAIAnalyses', 'U') IS NOT NULL DROP TABLE inference.ReviewAIAnalyses;

IF OBJECT_ID('coresync.Reviews', 'U') IS NOT NULL DROP TABLE coresync.Reviews;
IF OBJECT_ID('coresync.Customers', 'U') IS NOT NULL DROP TABLE coresync.Customers;
IF OBJECT_ID('coresync.Products', 'U') IS NOT NULL DROP TABLE coresync.Products;
IF OBJECT_ID('coresync.StoreConnections', 'U') IS NOT NULL DROP TABLE coresync.StoreConnections;
IF OBJECT_ID('coresync.Platforms', 'U') IS NOT NULL DROP TABLE coresync.Platforms;

IF OBJECT_ID('security.RefreshTokens', 'U') IS NOT NULL DROP TABLE security.RefreshTokens;
IF OBJECT_ID('security.SystemUsers', 'U') IS NOT NULL DROP TABLE security.SystemUsers;
GO

-- =============================================================================
-- 1. SCHEMA: security
-- =============================================================================

CREATE TABLE security.SystemUsers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'STORE_MANAGER',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
GO

CREATE TABLE security.RefreshTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Token NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIMEOFFSET NOT NULL,
    CreatedByIp NVARCHAR(45) NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    RevokedAt DATETIMEOFFSET NULL,
    RevokedByIp NVARCHAR(45) NULL,
    ReplacedByToken NVARCHAR(500) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_RefreshTokens_SystemUsers FOREIGN KEY (UserId) REFERENCES security.SystemUsers(Id) ON DELETE CASCADE
);
CREATE INDEX IX_RefreshTokens_UserId_IsRevoked ON security.RefreshTokens(UserId, IsRevoked);
GO

-- =============================================================================
-- 2. SCHEMA: coresync
-- =============================================================================

CREATE TABLE coresync.Platforms (
    Id INT PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    ApiBaseUrl NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE TABLE coresync.StoreConnections (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PlatformId INT NOT NULL,
    StoreName NVARCHAR(200) NOT NULL,
    StoreCodeOnPlatform NVARCHAR(100) NOT NULL,
    AccessToken NVARCHAR(MAX) NULL,
    RefreshToken NVARCHAR(MAX) NULL,
    TokenExpiresAt DATETIMEOFFSET NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT 'CONNECTED',
    LastSyncedAt DATETIMEOFFSET NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_StoreConnections_Platforms FOREIGN KEY (PlatformId) REFERENCES coresync.Platforms(Id)
);
GO

CREATE TABLE coresync.Products (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StoreId UNIQUEIDENTIFIER NOT NULL,
    PlatformProductId NVARCHAR(100) NOT NULL,
    Sku NVARCHAR(100) NULL,
    Name NVARCHAR(500) NOT NULL,
    ImageUrl NVARCHAR(MAX) NULL,
    ProductUrl NVARCHAR(MAX) NULL,
    CategoryName NVARCHAR(200) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_Products_StoreConnections FOREIGN KEY (StoreId) REFERENCES coresync.StoreConnections(Id) ON DELETE CASCADE
);
GO

CREATE TABLE coresync.Customers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StoreId UNIQUEIDENTIFIER NOT NULL,
    PlatformUserId NVARCHAR(100) NOT NULL,
    DisplayName NVARCHAR(200) NULL,
    AvatarUrl NVARCHAR(MAX) NULL,
    TotalReviewsCount INT NOT NULL DEFAULT 1,
    RiskLevel NVARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_Customers_StoreConnections FOREIGN KEY (StoreId) REFERENCES coresync.StoreConnections(Id) ON DELETE CASCADE
);
GO

CREATE TABLE coresync.Reviews (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StoreId UNIQUEIDENTIFIER NULL,
    ProductId UNIQUEIDENTIFIER NULL,
    CustomerId UNIQUEIDENTIFIER NULL,
    PlatformReviewId NVARCHAR(100) NOT NULL UNIQUE,
    OrderIdOnPlatform NVARCHAR(100) NULL,
    Rating TINYINT NOT NULL DEFAULT 5,
    CommentText NVARCHAR(MAX) NULL,
    MediaUrlsJson NVARCHAR(MAX) NULL,
    ReviewCreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    SyncedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    Status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL,
    CONSTRAINT FK_Reviews_StoreConnections FOREIGN KEY (StoreId) REFERENCES coresync.StoreConnections(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Products FOREIGN KEY (ProductId) REFERENCES coresync.Products(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Reviews_Customers FOREIGN KEY (CustomerId) REFERENCES coresync.Customers(Id) ON DELETE NO ACTION
);
CREATE INDEX IX_Reviews_Store_Status_Rating ON coresync.Reviews(StoreId, Status, Rating);
CREATE INDEX IX_Reviews_ReviewCreatedAt ON coresync.Reviews(ReviewCreatedAt);
GO

-- =============================================================================
-- 3. SCHEMA: inference
-- =============================================================================

CREATE TABLE inference.ReviewAIAnalysis (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReviewId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    OverallSentiment NVARCHAR(30) NOT NULL DEFAULT 'POS',
    SentimentScore REAL NOT NULL DEFAULT 0.0,
    IsSpam BIT NOT NULL DEFAULT 0,
    IsIntentQa BIT NOT NULL DEFAULT 0,
    CustomerInsight NVARCHAR(MAX) NULL,
    RootCause NVARCHAR(MAX) NULL,
    BusinessRecommendation NVARCHAR(MAX) NULL,
    SuggestedSellerResponse NVARCHAR(MAX) NULL,
    Language NVARCHAR(10) NOT NULL DEFAULT 'vi',
    ModelVersion NVARCHAR(50) NOT NULL DEFAULT 'ViSoBERT-ABSA-v8',
    ProcessedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
CREATE INDEX IX_ReviewAIAnalysis_OverallSentiment ON inference.ReviewAIAnalysis(OverallSentiment);
GO

CREATE TABLE inference.ReviewAspects (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReviewId UNIQUEIDENTIFIER NOT NULL,
    MacroCategory NVARCHAR(50) NOT NULL,
    MicroAspect NVARCHAR(100) NOT NULL,
    Sentiment NVARCHAR(30) NOT NULL DEFAULT 'POS',
    AspectScore REAL NOT NULL DEFAULT 1.0,
    AspectThreshold REAL NULL,
    SentimentScore REAL NOT NULL DEFAULT 1.0,
    SentimentThreshold REAL NULL,
    EvidenceText NVARCHAR(500) NULL,
    EvidenceStart INT NULL,
    EvidenceEnd INT NULL,
    EvidenceSource NVARCHAR(50) NULL,
    OverrideReason NVARCHAR(255) NULL
);
CREATE INDEX IX_ReviewAspects_ReviewId ON inference.ReviewAspects(ReviewId);
CREATE INDEX IX_ReviewAspects_MacroCategory ON inference.ReviewAspects(MacroCategory);
GO

CREATE TABLE inference.ReviewKeywords (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReviewId UNIQUEIDENTIFIER NOT NULL,
    Keyword NVARCHAR(100) NOT NULL,
    Weight REAL NOT NULL DEFAULT 1.0
);
CREATE INDEX IX_ReviewKeywords_ReviewId ON inference.ReviewKeywords(ReviewId);
GO

-- =============================================================================
-- 4. SCHEMA: engagement
-- =============================================================================

CREATE TABLE engagement.ResponseTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StoreId UNIQUEIDENTIFIER NULL,
    Title NVARCHAR(200) NOT NULL,
    TargetRating TINYINT NULL,
    TargetSentiment NVARCHAR(50) NULL,
    TargetAspect NVARCHAR(100) NULL,
    ContentTemplate NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
GO

CREATE TABLE engagement.AutomationRules (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StoreId UNIQUEIDENTIFIER NULL,
    RuleName NVARCHAR(200) NOT NULL,
    MinRating TINYINT NOT NULL DEFAULT 1,
    MaxRating TINYINT NOT NULL DEFAULT 5,
    ApplySentimentsJson NVARCHAR(MAX) NULL,
    ActionType NVARCHAR(50) NOT NULL DEFAULT 'AUTO_REPLY_IMMEDIATELY',
    DelayMinutes INT NOT NULL DEFAULT 0,
    SelectedTemplateId UNIQUEIDENTIFIER NULL,
    UseAiGenerative BIT NOT NULL DEFAULT 0,
    AutoCreateTicket BIT NOT NULL DEFAULT 0,
    IsEnabled BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
GO

CREATE TABLE engagement.ReviewResponses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReviewId UNIQUEIDENTIFIER NOT NULL,
    ResponseText NVARCHAR(MAX) NOT NULL,
    ResponseType NVARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC',
    TemplateId UNIQUEIDENTIFIER NULL,
    AiGeneratedSuggestion NVARCHAR(MAX) NULL,
    RespondedByUserId UNIQUEIDENTIFIER NULL,
    PlatformResponseId NVARCHAR(100) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'SENT',
    ErrorMessage NVARCHAR(MAX) NULL,
    SentAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
CREATE INDEX IX_ReviewResponses_ReviewId ON engagement.ReviewResponses(ReviewId);
GO

CREATE TABLE engagement.Tickets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReviewId UNIQUEIDENTIFIER NOT NULL,
    StoreId UNIQUEIDENTIFIER NOT NULL,
    CustomerId UNIQUEIDENTIFIER NULL,
    CustomerName NVARCHAR(150) NULL,
    CustomerPhone NVARCHAR(50) NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Priority NVARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    Status NVARCHAR(50) NOT NULL DEFAULT 'OPEN',
    AssignedToUserId UNIQUEIDENTIFIER NULL,
    ResolutionNote NVARCHAR(MAX) NULL,
    ResolvedAt DATETIMEOFFSET NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
CREATE INDEX IX_Tickets_AssignedToUserId_Status ON engagement.Tickets(AssignedToUserId, Status);
CREATE INDEX IX_Tickets_ReviewId ON engagement.Tickets(ReviewId);
GO

-- =============================================================================
-- 5. SCHEMA: reporting
-- =============================================================================

CREATE TABLE reporting.AuditLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NULL,
    Details NVARCHAR(MAX) NULL,
    OldValuesJson NVARCHAR(MAX) NULL,
    NewValuesJson NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
CREATE INDEX IX_AuditLogs_UserId ON reporting.AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_CreatedAt ON reporting.AuditLogs(CreatedAt);
GO

CREATE TABLE reporting.DailyPlatformSummaries (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SummaryDate DATE NOT NULL,
    PlatformCode NVARCHAR(50) NOT NULL,
    TotalReviews INT NOT NULL DEFAULT 0,
    PositiveCount INT NOT NULL DEFAULT 0,
    NegativeCount INT NOT NULL DEFAULT 0,
    NeutralCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NULL
);
CREATE UNIQUE INDEX IX_DailyPlatformSummaries_Date_Platform ON reporting.DailyPlatformSummaries(SummaryDate, PlatformCode);
GO

-- =============================================================================
-- SEED INITIAL DATA
-- =============================================================================

-- 1. Users
INSERT INTO security.SystemUsers (Id, Email, PasswordHash, FullName, PhoneNumber, Role, IsActive, CreatedAt)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@higen.vn', '$2a$11$0dY6q1mQhW3m1Fh.ZlhBCOKsqJgW7fKqV4Fz10FzXp9u9Xl8iGqy.', N'System Administrator', '0901234567', 'ADMIN', 1, SYSDATETIMEOFFSET()),
    ('11111111-1111-1111-1111-111111111112', 'admin@higen-absa.com', '$2a$11$0dY6q1mQhW3m1Fh.ZlhBCOKsqJgW7fKqV4Fz10FzXp9u9Xl8iGqy.', N'HIGEN Administrator', '0987654321', 'ADMIN', 1, SYSDATETIMEOFFSET());

-- 2. Platforms
INSERT INTO coresync.Platforms (Id, Code, Name, ApiBaseUrl, IsActive, CreatedAt)
VALUES
    (1, 'SHOPEE', N'Shopee Việt Nam', 'https://api.shopee.vn', 1, SYSDATETIMEOFFSET()),
    (2, 'LAZADA', N'Lazada Việt Nam', 'https://api.lazada.vn', 1, SYSDATETIMEOFFSET()),
    (3, 'TIKI', N'Tiki Việt Nam', 'https://api.tiki.vn', 1, SYSDATETIMEOFFSET()),
    (4, 'TIKTOK_SHOP', N'TikTok Shop Việt Nam', 'https://api.tiktok.com', 1, SYSDATETIMEOFFSET());

-- 3. Store Connections
INSERT INTO coresync.StoreConnections (Id, PlatformId, StoreName, StoreCodeOnPlatform, Status, CreatedAt)
VALUES
    ('22222222-2222-2222-2222-222222222222', 1, N'HIGEN Official Store', 'HIGEN_SHOP_01', 'CONNECTED', SYSDATETIMEOFFSET());

-- 4. Products
INSERT INTO coresync.Products (Id, StoreId, PlatformProductId, Sku, Name, CategoryName, CreatedAt)
VALUES
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'SP_001', 'HIGEN-AIR-01', N'Tai nghe Bluetooth HIGEN AirPro Chống ồn', N'Thiết bị âm thanh', SYSDATETIMEOFFSET());

-- 5. Customers
INSERT INTO coresync.Customers (Id, StoreId, PlatformUserId, DisplayName, TotalReviewsCount, RiskLevel, CreatedAt)
VALUES
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'USER_SHOPEE_99', N'Nguyễn Văn A', 3, 'NORMAL', SYSDATETIMEOFFSET());

-- 6. Reviews
INSERT INTO coresync.Reviews (Id, StoreId, ProductId, CustomerId, PlatformReviewId, OrderIdOnPlatform, Rating, CommentText, Status, ReviewCreatedAt, SyncedAt, CreatedAt)
VALUES
    ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'REV_SHOPEE_001', 'ORD_20261031_001', 5, N'Sản phẩm nghe rất hay, bass ấm, giao hàng siêu nhanh, shop phục vụ chu đáo.', 'REPLIED', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- 7. Review AI Analysis
INSERT INTO inference.ReviewAIAnalysis (Id, ReviewId, OverallSentiment, SentimentScore, IsSpam, IsIntentQa, CustomerInsight, SuggestedSellerResponse, Language, ModelVersion, ProcessedAt, CreatedAt)
VALUES
    ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'POS', 0.96, 0, 0, N'Khách hàng đánh giá rất cao chất âm và tốc độ giao hàng của shop', N'HIGEN chân thành cảm ơn bạn đã tin dùng sản phẩm Tai nghe AirPro!', 'vi', 'ViSoBERT-ABSA-v8', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- 8. Review Aspects
INSERT INTO inference.ReviewAspects (ReviewId, MacroCategory, MicroAspect, Sentiment, AspectScore, SentimentScore, EvidenceText)
VALUES
    ('55555555-5555-5555-5555-555555555555', 'PRODUCT', N'CHẤT_ÂM', 'POS', 0.98, 0.95, N'Sản phẩm nghe rất hay, bass ấm'),
    ('55555555-5555-5555-5555-555555555555', 'SHIPPING', N'TỐC_ĐỘ_GIAO_HÀNG', 'POS', 0.99, 0.98, N'giao hàng siêu nhanh'),
    ('55555555-5555-5555-5555-555555555555', 'SERVICE', N'THÁI_ĐỘ_PHỤC_VỤ', 'POS', 0.95, 0.96, N'shop phục vụ chu đáo');

-- 9. Response Templates
INSERT INTO engagement.ResponseTemplates (Id, StoreId, Title, TargetRating, TargetSentiment, ContentTemplate, IsActive, CreatedAt)
VALUES
    ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', N'Mẫu cảm ơn đánh giá 5 sao', 5, 'POS', N'Dạ HIGEN chân thành cảm ơn bạn đã tin tưởng và đánh giá 5 sao cho shop!', 1, SYSDATETIMEOFFSET());

-- 10. Automation Rules
INSERT INTO engagement.AutomationRules (Id, StoreId, RuleName, MinRating, MaxRating, ActionType, DelayMinutes, IsEnabled, CreatedAt)
VALUES
    ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', N'Tự động phản hồi đánh giá tích cực', 5, 5, 'AUTO_REPLY_IMMEDIATELY', 0, 1, SYSDATETIMEOFFSET());
GO
