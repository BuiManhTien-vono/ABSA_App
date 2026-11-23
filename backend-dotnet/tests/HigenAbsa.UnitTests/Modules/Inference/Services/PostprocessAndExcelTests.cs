using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using HigenAbsa.Modules.Inference.Application.Contracts;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.DTOs;
using HigenAbsa.Modules.Inference.Domain;
using HigenAbsa.Modules.Inference.Endpoints;
using HigenAbsa.SharedKernel.Events;
using HigenAbsa.UnitTests.Modules.Inference.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Inference.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 2 (Nhóm 2.2): Hậu xử lý Phân cấp (Postprocess), Sinh Insight tự động,
/// Xử lý Sự kiện Đánh giá mới (ReviewCreatedEventHandler) và Phân tích hàng loạt từ CSV/Excel.
/// </summary>
public class PostprocessAndExcelTests
{
    [Fact]
    public void ApplyPostprocess_MixedPositiveAndNegativeAspects_DerivesMixedOverallAndGeneratesVietnameseInsight()
    {
        // [TC-BE-INF-05] Chuẩn ISO 25010:2023 (Functional Completeness & Correctness)
        // 1. Arrange (Chuẩn bị): Kết quả dự đoán có 1 khía cạnh khen mẫu mã (POS) và 1 khía cạnh chê giao chậm (NEG)
        const string text = "Mẫu mã đẹp nhưng giao hàng chậm quá.";
        var result = new PredictionResult
        {
            Text = text,
            NormalizedText = text,
            OverallSentiment = new OverallSentiment { Label = "POS", Score = 0.65f },
            AspectSentiments =
            [
                new AspectSentimentEntry
                {
                    Macro = "OTHERS", // Cố tình đặt sai Macro để kiểm tra Hierarchy Correction
                    Micro = "Appearance_Design",
                    Sentiment = "POS",
                    AspectScore = 0.95f,
                    SentimentScore = 0.94f,
                    Evidence = "Mẫu mã đẹp",
                    EvidenceStart = 0,
                    EvidenceEnd = 10
                },
                new AspectSentimentEntry
                {
                    Macro = "SHIPPING",
                    Micro = "Delivery_Speed",
                    Sentiment = "NEG",
                    AspectScore = 0.92f,
                    SentimentScore = 0.91f,
                    Evidence = "giao hàng chậm quá",
                    EvidenceStart = 17,
                    EvidenceEnd = 35
                }
            ]
        };

        // 2. Act (Thực thi): Chạy toàn bộ pipeline hậu xử lý
        Postprocess.ApplyPostprocess(result, text);

        // 3. Assert (Kiểm chứng): Sửa đúng Macro PRODUCT, suy diễn cảm xúc tổng thể MIXED và sinh đủ Insight tiếng Việt
        Assert.Equal("MIXED", result.OverallSentiment.Label);
        Assert.Equal("PRODUCT", result.AspectSentiments.First(a => a.Micro == "Appearance_Design").Macro);
        Assert.Contains(result.Macros, m => m.Label == "PRODUCT");
        Assert.Contains(result.Macros, m => m.Label == "SHIPPING");
        Assert.NotNull(result.Insight);
        Assert.Contains("hình thức/mẫu mã sản phẩm", result.Insight.CustomerInsight);
        Assert.Contains("tốc độ giao hàng", result.Insight.RootCause);
        Assert.Contains("SLA vận chuyển", result.Insight.BusinessRecommendation);
    }

    [Fact]
    public void ApplyPostprocess_SpamAndQuestionMicros_SetsFlagsAndExcludesFromCustomerInsight()
    {
        // [TC-BE-INF-06] Chuẩn ISO 25010:2023 (Functional Appropriateness)
        // 1. Arrange (Chuẩn bị): Bình luận vừa hỏi đáp vừa bình luận nhận xu
        const string text = "Shop ơi sản phẩm này có bền không? Đánh giá nhận xu......";
        var result = new PredictionResult
        {
            Text = text,
            NormalizedText = text,
            OverallSentiment = new OverallSentiment { Label = "NEU", Score = 0.80f },
            AspectSentiments =
            [
                new AspectSentimentEntry
                {
                    Macro = "OTHERS",
                    Micro = "Intent_QA",
                    Sentiment = "NEU",
                    Evidence = "Shop ơi sản phẩm này có bền không"
                },
                new AspectSentimentEntry
                {
                    Macro = "OTHERS",
                    Micro = "Spam_Noise",
                    Sentiment = "NEU",
                    Evidence = "nhận xu"
                }
            ]
        };

        // 2. Act (Thực thi): Chạy hậu xử lý
        Postprocess.ApplyPostprocess(result, text);

        // 3. Assert (Kiểm chứng): Bật cờ Spam và IntentQa, đồng thời không đưa nhãn nhiễu vào CustomerInsight
        Assert.True(result.Spam);
        Assert.True(result.IntentQa);
        Assert.NotNull(result.Insight);
        Assert.DoesNotContain("nội dung spam", result.Insight.CustomerInsight);
    }

    [Fact]
    public async Task ReviewCreatedEventHandler_NegativeReview_PersistsAnalysisAndPublishesNegativeReviewDetectedEvent()
    {
        // [TC-BE-INF-08] Chuẩn ISO 29119-4 (State Transition)
        // 1. Arrange (Chuẩn bị): Khởi tạo ngữ cảnh Inference trên RAM và sự kiện đánh giá 1 sao có từ khóa lỗi
        using var context = new InferenceTestContext();
        var reviewId = Guid.NewGuid();
        var storeId = Guid.NewGuid();
        var evt = new ReviewCreatedIntegrationEvent(
            reviewId,
            storeId,
            Rating: 1,
            ReviewText: "Sản phẩm bị lỗi nặng, giao hàng quá chậm!",
            ReviewCreatedAt: DateTimeOffset.UtcNow);

        // 2. Act (Thực thi): Xử lý sự kiện đánh giá mới
        await context.ReviewCreatedHandler.HandleAsync(evt);

        // 3. Assert (Kiểm chứng): Lưu ReviewAIAnalysis + ReviewAspects vào DB và phát sự kiện NegativeReviewDetected (Priority = HIGH)
        var savedAnalysis = await context.DbContext.ReviewAIAnalyses.FirstOrDefaultAsync(a => a.ReviewId == reviewId);
        Assert.NotNull(savedAnalysis);
        Assert.Equal("NEG", savedAnalysis.OverallSentiment);

        var savedAspects = await context.DbContext.ReviewAspects.Where(a => a.ReviewId == reviewId).ToListAsync();
        Assert.NotEmpty(savedAspects);

        var negEvent = Assert.Single(context.EventBus.PublishedEvents.OfType<NegativeReviewDetectedIntegrationEvent>());
        Assert.Equal(reviewId, negEvent.ReviewId);
        Assert.Equal("HIGH", negEvent.Priority);
    }

    [Fact]
    public async Task ReviewCreatedEventHandler_DuplicateReviewId_IsIdempotentAndDoesNotDuplicateAnalysis()
    {
        // [TC-BE-INF-09] Chuẩn ISO 25010:2023 (Reliability - Idempotency)
        // 1. Arrange (Chuẩn bị): Tạo sự kiện đánh giá mới
        using var context = new InferenceTestContext();
        var reviewId = Guid.NewGuid();
        var evt = new ReviewCreatedIntegrationEvent(
            reviewId,
            Guid.NewGuid(),
            Rating: 5,
            ReviewText: "Sản phẩm dùng rất êm và tốt!",
            ReviewCreatedAt: DateTimeOffset.UtcNow);

        // 2. Act (Thực thi): Gửi lặp sự kiện 2 lần liên tiếp
        await context.ReviewCreatedHandler.HandleAsync(evt);
        await context.ReviewCreatedHandler.HandleAsync(evt);

        // 3. Assert (Kiểm chứng): Chỉ có đúng 1 bản ghi trong DB và 1 sự kiện ReviewAnalyzed được phát ra
        int countInDb = await context.DbContext.ReviewAIAnalyses.CountAsync(a => a.ReviewId == reviewId);
        Assert.Equal(1, countInDb);
        Assert.Single(context.EventBus.PublishedEvents.OfType<ReviewAnalyzedIntegrationEvent>());
    }

    [Fact]
    public async Task ProcessExcelStreamAsync_ValidVietnameseCsvStream_AnalyzesRowsPersistsToDbAndComputesAspectSummary()
    {
        // [TC-BE-INF-10] Chuẩn ISO 25010:2023 (Functional Completeness)
        // 1. Arrange (Chuẩn bị): Tạo luồng CSV trên RAM có cột tiếng Việt và 1 dòng quá ngắn (< 3 ký tự) cần lọc bỏ
        using var context = new InferenceTestContext();
        const string csvContent =
            "Nội dung đánh giá,Sản phẩm,Khách hàng,Số sao\n" +
            "Tai nghe dùng rất tốt và pin bền,Tai nghe AirPro,Nguyễn Văn A,5\n" +
            "Sản phẩm bị lỗi không sạc được,Tai nghe AirPro,Trần Thị B,1\n" +
            "ok,Tai nghe AirPro,Lê Văn C,5\n";

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));

        // 2. Act (Thực thi): Phân tích luồng CSV và lưu kết quả vào DB RAM
        var result = await context.ExcelAnalysisService.ProcessExcelStreamAsync(stream, "danh_gia_test.csv", saveToDb: true);

        // 3. Assert (Kiểm chứng): Xử lý đúng 2 dòng hợp lệ (bỏ dòng "ok" < 3 ký tự), 1 POS (50%), 1 NEG (50%) và lưu DB
        Assert.Equal(3, result.TotalRows);
        Assert.Equal(2, result.ProcessedRows);
        Assert.Equal(1, result.PositiveCount);
        Assert.Equal(1, result.NegativeCount);
        Assert.Equal(50.0f, result.PositivePercentage);
        Assert.Equal(50.0f, result.NegativePercentage);
        Assert.NotEmpty(result.TopAspects);
        Assert.Equal(2, await context.DbContext.ReviewAIAnalyses.CountAsync());
    }

    [Fact]
    public async Task ProcessExcelStreamAsync_EmptyOrHeaderOnlyCsvStream_ThrowsInvalidOperationException()
    {
        // [TC-BE-INF-11] Chuẩn ISO 29119-4 (Boundary Value Analysis - Tệp chỉ có tiêu đề không có dữ liệu)
        // 1. Arrange (Chuẩn bị): Luồng CSV chỉ có dòng tiêu đề
        using var context = new InferenceTestContext();
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("content,title,rating\n"));

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải ném InvalidOperationException rõ ràng
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.ExcelAnalysisService.ProcessExcelStreamAsync(stream, "empty.csv", saveToDb: false));
    }

    [Fact]
    public void RemoveUnfoundedSpecialAspects_NullEvidenceAndApologyPerformance_RemovesSpuriousAspects()
    {
        // [TC-BE-INF-17] Chuẩn ISO/IEC TR 24029 (AI Robustness - Loại bỏ khía cạnh ảo không có bằng chứng)
        // 1. Arrange (Chuẩn bị): 1 khía cạnh thiếu Evidence, 1 Performance_Functionality gắn nhầm cụm "xin lỗi", 1 khía cạnh hợp lệ
        var prediction = new PredictionResult
        {
            Text = "Shop xin lỗi khách và đóng gói rất kỹ",
            AspectSentiments =
            [
                new AspectSentimentEntry { Macro = "PRICE", Micro = "Price_Promotion", Sentiment = "POS", Evidence = null },
                new AspectSentimentEntry { Macro = "PRODUCT", Micro = "Performance_Functionality", Sentiment = "NEG", Evidence = "Shop xin lỗi rất nhiều" },
                new AspectSentimentEntry { Macro = "SHIPPING", Micro = "External_Packaging", Sentiment = "POS", Evidence = "đóng gói rất kỹ" }
            ],
            Micros =
            [
                new LabelEntry { Label = "Price_Promotion", Score = 0.8f },
                new LabelEntry { Label = "Performance_Functionality", Score = 0.7f },
                new LabelEntry { Label = "External_Packaging", Score = 0.9f }
            ]
        };

        // 2. Act (Thực thi): Chạy RemoveUnfoundedSpecialAspects
        Postprocess.RemoveUnfoundedSpecialAspects(prediction);

        // 3. Assert (Kiểm chứng): Chỉ còn lại duy nhất khía cạnh External_Packaging có bằng chứng hợp lệ
        var remaining = Assert.Single(prediction.AspectSentiments);
        Assert.Equal("External_Packaging", remaining.Micro);
        Assert.Single(prediction.Micros);
    }

    [Fact]
    public async Task ProcessExcelStreamAsync_EnglishCsvColumnsWithSaveToDbFalse_DoesNotPersistRows()
    {
        // [TC-BE-INF-18] Chuẩn ISO 25010:2023 (Interoperability - Hỗ trợ cột tiếng Anh & chế độ xem trước saveToDb=false)
        // 1. Arrange (Chuẩn bị): CSV dùng tên cột tiếng Anh ("comment,rating,product")
        using var context = new InferenceTestContext();
        const string csvContent =
            "comment,rating,product\n" +
            "Sản phẩm chạy rất êm và mát,5,Quạt điện\n" +
            "Giao hàng quá chậm nha shop,2,Quạt điện\n";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));

        // 2. Act (Thực thi): Chạy phân tích với saveToDb: false
        var result = await context.ExcelAnalysisService.ProcessExcelStreamAsync(stream, "english_batch.csv", saveToDb: false);

        // 3. Assert (Kiểm chứng): Tính đúng thống kê 2 dòng (1 POS, 1 NEG) nhưng DB RAM vẫn bằng 0
        Assert.Equal(2, result.TotalRows);
        Assert.Equal(2, result.ProcessedRows);
        Assert.Equal(1, result.PositiveCount);
        Assert.Equal(1, result.NegativeCount);
        Assert.Equal(0, await context.DbContext.ReviewAIAnalyses.CountAsync());
    }

    [Fact]
    public async Task ProcessExcelStreamAsync_UnsupportedFileExtension_ThrowsInvalidOperationException()
    {
        // [TC-BE-INF-19] Chuẩn ISO 29119-4 (Error Guessing - Từ chối định dạng file không được hỗ trợ .txt)
        // 1. Arrange (Chuẩn bị): Luồng dữ liệu mang đuôi .txt
        using var context = new InferenceTestContext();
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("San pham tot lam"));

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Từ chối bằng InvalidOperationException
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.ExcelAnalysisService.ProcessExcelStreamAsync(stream, "reviews.txt", saveToDb: false));
    }

    [Fact]
    public async Task InferenceLookupService_AnalyzedAndMissingReview_ReturnsContractDtoOrNull()
    {
        // [TC-BE-INF-20] Chuẩn ISO 25010:2023 (Modularity - Hợp đồng IInferenceLookupContract liên phân hệ)
        // 1. Arrange (Chuẩn bị): Lưu 1 bản ghi ReviewAIAnalysis vào DB Inference trên RAM
        using var context = new InferenceTestContext();
        var reviewId = Guid.NewGuid();
        context.DbContext.ReviewAIAnalyses.Add(new ReviewAIAnalysis
        {
            Id = Guid.NewGuid(),
            ReviewId = reviewId,
            OverallSentiment = "NEG",
            SentimentScore = 0.94f,
            RootCause = "Hỏng pin sau 2 ngày",
            SuggestedSellerResponse = "Shop xin hỗ trợ bảo hành đổi mới ạ!"
        });
        await context.DbContext.SaveChangesAsync();

        var lookup = new InferenceLookupService(context.DbContext);

        // 2. Act (Thực thi): Tra cứu ID đã phân tích và ID chưa tồn tại
        var found = await lookup.GetAnalysisByReviewIdAsync(reviewId);
        var missing = await lookup.GetAnalysisByReviewIdAsync(Guid.NewGuid());

        // 3. Assert (Kiểm chứng): Trả về đầy đủ InferenceSummaryContractDto hoặc null
        Assert.NotNull(found);
        Assert.Equal("NEG", found.OverallSentiment);
        Assert.Equal("Hỏng pin sau 2 ngày", found.RootCause);
        Assert.Null(missing);
    }

    [Fact]
    public async Task ProcessExcelStreamAsync_ExcessiveRowCountAboveAntiDoSLimit_ThrowsInvalidOperationException()
    {
        // [TC-BE-INF-23] Chuẩn OWASP API4:2023 (Unrestricted Resource Consumption - Chặn DDoS file CSV/Excel vượt ngưỡng dòng · ISO TDD)
        // 1. Arrange (Chuẩn bị): Sinh file CSV chứa 2,500 dòng đánh giá trong 1 lần tải lên
        using var context = new InferenceTestContext();
        var sb = new StringBuilder();
        sb.AppendLine("comment,rating,product");
        for (int i = 0; i < 2500; i++)
        {
            sb.AppendLine($"Sản phẩm rất tốt lần {i},5,Quạt điện");
        }
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(sb.ToString()));

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải chặn tệp vượt trần xử lý bằng InvalidOperationException để chống treo RAM/AI DDoS
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.ExcelAnalysisService.ProcessExcelStreamAsync(stream, "ddos_2500_rows.csv", saveToDb: false));
    }

    [Fact]
    public async Task InferenceController_Endpoints_RequireAuthorizeAndCapBatchSizeForAntiDoS()
    {
        // [TC-BE-INF-24] Chuẩn OWASP API1/API4 (Authentication & Batch AI Anti-DDoS trên InferenceController · ISO TDD)
        // 1. Arrange (Chuẩn bị): Kiểm tra thuộc tính [Authorize] trên InferenceController và chuẩn bị batch 250 câu
        var ctrlAuth = Attribute.GetCustomAttribute(typeof(InferenceController), typeof(AuthorizeAttribute));
        var predictMethod = typeof(InferenceController).GetMethod(nameof(InferenceController.Predict));
        var uploadMethod = typeof(InferenceController).GetMethod(nameof(InferenceController.UploadExcelReviewFile));

        var controller = new InferenceController(
            new FakeInferenceService(),
            scopeFactory: null!,
            NullLogger<InferenceController>.Instance);

        var oversizedBatch = new BatchPredictRequest
        {
            Texts = Enumerable.Range(0, 250).Select(i => $"Đánh giá thử tải DDoS số {i}").ToList()
        };

        // 2. Act (Thực thi): Gọi PredictBatch với 250 phần tử vượt ngưỡng an toàn (ví dụ max 100/request)
        var batchResult = await controller.PredictBatch(oversizedBatch);

        // 3. Assert (Kiểm chứng): Endpoints suy luận tốn CPU/GPU bắt buộc phải có [Authorize] và chặn batch quá khổ bằng BadRequest
        Assert.NotNull(ctrlAuth ?? Attribute.GetCustomAttribute(predictMethod!, typeof(AuthorizeAttribute)));
        Assert.NotNull(ctrlAuth ?? Attribute.GetCustomAttribute(uploadMethod!, typeof(AuthorizeAttribute)));
        Assert.IsType<BadRequestObjectResult>(batchResult);
    }
}
