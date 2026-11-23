using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.DTOs;
using HigenAbsa.Modules.Inference.Endpoints;
using HigenAbsa.UnitTests.Modules.Inference.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Inference.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 2 (Nhóm 2.1): Tiền xử lý văn bản, Toán học Xác suất (Sigmoid/Softmax)
/// và Luật Ghi đè Miền Thương mại điện tử Việt Nam (DomainOverrides).
/// Đối chiếu chuẩn ISO/IEC/IEEE 29119-3, ISO/IEC 25010:2023 và ISO/IEC TR 24029 (AI Robustness).
/// </summary>
public class TextAndDomainOverrideTests
{
    [Fact]
    public void CleanText_ReviewPrefixAndIrregularWhitespace_NormalizesTextCorrectly()
    {
        // [TC-BE-INF-01] Chuẩn ISO 29119-4 (Equivalence Partitioning)
        // 1. Arrange (Chuẩn bị): Chuỗi đánh giá có tiền tố "Review 12:" và các ký tự xuống dòng, tab thừa
        const string rawText = "   Review 12 :   Tai nghe   nghe rất\n\t êm   và pin trâu   ";

        // 2. Act (Thực thi): Làm sạch văn bản trước khi đưa vào Tokenizer
        string cleaned = TextUtils.CleanText(rawText);

        // 3. Assert (Kiểm chứng): Cắt bỏ hoàn toàn tiền tố Review N: và chuẩn hóa khoảng trắng đơn
        Assert.Equal("Tai nghe nghe rất êm và pin trâu", cleaned);
    }

    [Fact]
    public void ClauseSpanForMatch_VietnameseContrastConjunctions_ExtractsExactClauseBoundary()
    {
        // [TC-BE-INF-02] Chuẩn ISO 29119-4 (Boundary Value Analysis)
        // 1. Arrange (Chuẩn bị): Câu ghép có liên từ tương phản "nhưng" ngăn cách hai mệnh đề khen/chê
        const string text = "Mẫu mã rất đẹp nhưng giao hàng quá chậm!";
        int matchStart = text.IndexOf("chậm", StringComparison.Ordinal);
        int matchEnd = matchStart + "chậm".Length;

        // 2. Act (Thực thi): Mở rộng vùng bằng chứng (Evidence Span) ra biên mệnh đề chứa từ khóa
        var (start, end, evidence) = TextUtils.ClauseSpanForMatch(text, matchStart, matchEnd);

        // 3. Assert (Kiểm chứng): Vùng bằng chứng chỉ lấy mệnh đề sau chữ "nhưng", không lẫn mệnh đề khen phía trước
        Assert.Equal("giao hàng quá chậm", evidence);
        Assert.Equal(evidence, text[start..end]);
    }

    [Fact]
    public void DetectDomainOverrides_CounterfeitAndBrokenSealCues_DetectsNegativeAuthenticityWithEvidence()
    {
        // [TC-BE-INF-03] Chuẩn ISO 25010:2023 (Functional Appropriateness)
        // 1. Arrange (Chuẩn bị): Bình luận tố cáo hàng giả và mất niêm phong
        const string text = "Mở hộp ra thấy seal bị bóc sẵn, nghi là hàng giả kém chất lượng.";

        // 2. Act (Thực thi): Quét quy tắc ghi đè miền thương mại điện tử
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Bắt trúng khía cạnh Authenticity_Packaging mang cảm xúc NEG kèm gợi ý tổng thể NEG
        var authOverride = Assert.Single(overrides, o => o.Micro == "Authenticity_Packaging");
        Assert.Equal("PRODUCT", authOverride.Macro);
        Assert.Equal("NEG", authOverride.Sentiment);
        Assert.Equal("NEG", authOverride.OverallHint);
        Assert.NotNull(authOverride.Evidence);
        Assert.Contains("seal bị bóc", authOverride.Evidence, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void DetectDomainOverrides_NegatedCounterfeitPhrase_ExcludesFalsePositiveNegativeOverride()
    {
        // [TC-BE-INF-04] Chuẩn ISO/IEC TR 24029 (AI Robustness - Chống bẫy phủ định từ khóa)
        // 1. Arrange (Chuẩn bị): Câu khen có chứa cụm "không phải hàng giả"
        const string text = "Yên tâm nhé, không phải hàng giả đâu, hàng chính hãng 100%.";

        // 2. Act (Thực thi): Chạy bộ phát hiện DomainOverrides
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Không được báo nhầm NEG cho Authenticity_Packaging
        Assert.DoesNotContain(overrides, o => o.Micro == "Authenticity_Packaging" && o.Sentiment == "NEG");
    }

    [Fact]
    public void MathHelpers_SigmoidAndSoftmax_SatisfyProbabilityAxiomsAndNumericalStability()
    {
        // [TC-BE-INF-07] Chuẩn ISO 29119-4 (Boundary Value Analysis - Giá trị Logits cực lớn chống tràn số)
        // 1. Arrange (Chuẩn bị): Đầu vào logits tại điểm 0 và logits cực lớn [1000, 1001, 999]
        float[] zeroLogit = [0f];
        float[] extremeLogits = [1000f, 1001f, 999f];

        // 2. Act (Thực thi): Tính xác suất Sigmoid, Softmax và ArgMax
        float[] sigmoidOut = MathHelpers.Sigmoid(zeroLogit);
        float[] softmaxOut = MathHelpers.Softmax(extremeLogits);
        int argMaxIdx = MathHelpers.ArgMax(softmaxOut);

        // 3. Assert (Kiểm chứng): Sigmoid(0) = 0.5; Softmax không bị NaN/Inf, tổng xác suất = 1.0 và đỉnh ở vị trí 1
        Assert.Equal(0.5f, sigmoidOut[0], precision: 4);
        Assert.All(softmaxOut, p => Assert.True(float.IsFinite(p) && p >= 0f && p <= 1f));
        Assert.Equal(1.0f, softmaxOut.Sum(), precision: 4);
        Assert.Equal(1, argMaxIdx);
    }

    [Fact]
    public void DetectDomainOverrides_NegatedPackagingDamagePhrase_DoesNotMisclassifyAsNegative()
    {
        // [TC-BE-INF-12] Chuẩn ISO/IEC TR 24029 (AI NLU Robustness - Phủ định trên khía cạnh Đóng gói / Chất liệu)
        // 1. Arrange (Chuẩn bị): Khách hàng khen đóng gói tốt, hộp "không bị móp"
        const string text = "Shop đóng gói cực kỳ cẩn thận, hộp nguyên vẹn không bị móp chút nào.";

        // 2. Act (Thực thi): Quét quy tắc ghi đè miền
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Cụm "không bị móp" là lời khen, hệ thống không được bắt nhầm từ "bị móp" thành NEG
        Assert.DoesNotContain(overrides, o => o.Sentiment == "NEG");
    }

    [Fact]
    public void DetectDomainOverrides_SlowDeliveryAndRudeStaffCues_DetectsBothNegativeAspects()
    {
        // [TC-BE-INF-13] Chuẩn ISO 25010:2023 (Functional Completeness - Đa khía cạnh Giao hàng & Thái độ CSKH)
        // 1. Arrange (Chuẩn bị): Đánh giá phàn nàn cả giao hàng lâu lẫn thái độ nhân viên cọc cằn
        const string text = "Giao hàng chậm chờ quá lâu, nhân viên shop thái độ cọc cằn khó chịu.";

        // 2. Act (Thực thi): Quét luật ghi đè miền
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Phát hiện đủ cả Delivery_Speed (NEG) và Consulting_Attitude (NEG)
        Assert.Contains(overrides, o => o.Micro == "Delivery_Speed" && o.Sentiment == "NEG");
        Assert.Contains(overrides, o => o.Micro == "Consulting_Attitude" && o.Sentiment == "NEG");
    }

    [Fact]
    public void DetectDomainOverrides_PositivePackagingAndFreeship_DetectsPositiveAspects()
    {
        // [TC-BE-INF-14] Chuẩn ISO 25010:2023 (Functional Suitability - Tín hiệu Đóng gói & Phí vận chuyển)
        // 1. Arrange (Chuẩn bị): Đánh giá khen đóng gói cẩn thận và miễn phí vận chuyển
        const string text = "Shop đóng gói cẩn thận chắc chắn, được freeship nên rất ưng ý.";

        // 2. Act (Thực thi): Quét luật ghi đè miền
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Bắt đúng External_Packaging (POS) và Shipping_Fee (POS)
        Assert.Contains(overrides, o => o.Micro == "External_Packaging" && o.Sentiment == "POS");
        Assert.Contains(overrides, o => o.Micro == "Shipping_Fee" && o.Sentiment == "POS");
    }

    [Fact]
    public void DetectDomainOverrides_SpamNoiseRewardText_DetectsSpamNoiseNeutralCue()
    {
        // [TC-BE-INF-15] Chuẩn ISO 29119-4 (Equivalence Partitioning - Nhận diện bình luận câu xu Shopee/Lazada)
        // 1. Arrange (Chuẩn bị): Bình luận rác chuyên đi nhận xu không mang giá trị đánh giá sản phẩm
        const string text = "Viết cho đủ ký tự để nhận xu thôi ạ ........";

        // 2. Act (Thực thi): Quét luật ghi đè miền
        var overrides = DomainOverrides.DetectDomainOverrides(text);

        // 3. Assert (Kiểm chứng): Phát hiện đúng Spam_Noise với nhãn NEU
        Assert.Contains(overrides, o => o.Micro == "Spam_Noise" && o.Sentiment == "NEU");
    }

    [Fact]
    public void ApplyHierarchyCorrection_MismatchedMacro_SynchronizesParentMacroFromTaxonomy()
    {
        // [TC-BE-INF-16] Chuẩn ISO 25010:2023 (Functional Correctness - Hiệu chỉnh phân cấp Macro/Micro theo Taxonomy)
        // 1. Arrange (Chuẩn bị): Micro Delivery_Speed nhưng bị gán nhầm Macro là "PRODUCT" thay vì "SHIPPING"
        var prediction = new PredictionResult
        {
            Text = "Giao hàng rất nhanh",
            AspectSentiments =
            [
                new AspectSentimentEntry
                {
                    Macro = "PRODUCT",
                    Micro = "Delivery_Speed",
                    Sentiment = "POS",
                    SentimentPassedThreshold = true
                }
            ]
        };

        // 2. Act (Thực thi): Chạy ApplyHierarchyCorrection
        Postprocess.ApplyHierarchyCorrection(prediction);

        // 3. Assert (Kiểm chứng): Macro được sửa chuẩn về "SHIPPING", giữ ModelMacro="PRODUCT" và thêm "SHIPPING" vào Macros
        var aspect = Assert.Single(prediction.AspectSentiments);
        Assert.Equal("SHIPPING", aspect.Macro);
        Assert.Equal("PRODUCT", aspect.ModelMacro);
        Assert.Contains(prediction.Macros, m => m.Label == "SHIPPING");
    }

    [Fact]
    public void DetectDomainOverrides_VariantNegatedPackagingAndSeal_DoesNotMisclassifyAsNegative()
    {
        // [TC-BE-INF-21] Chuẩn ISO/IEC TR 29119-11 (NLP Negation - Biến thể phủ định "không hề móp" & "chưa thấy rách seal" · ISO TDD)
        // 1. Arrange (Chuẩn bị): Câu đánh giá khen ngợi dùng các biến thể phủ định tiếng Việt thực tế
        const string comment = "Shop bọc xốp cực chắc chắn, hộp không hề móp méo và chưa thấy rách tem hay rách seal gì cả";

        // 2. Act (Thực thi): Chạy luật ghi đè DomainOverrides
        var overrides = DomainOverrides.DetectDomainOverrides(comment);

        // 3. Assert (Kiểm chứng): Không được gán nhầm nhãn NEG cho đóng gói hay độ nguyên vẹn tem niêm phong
        Assert.DoesNotContain(overrides, o =>
            o.Sentiment == "NEG" &&
            (o.Micro == "External_Packaging" || o.Micro == "Material_BuildQuality" || o.Micro == "Authenticity_Packaging"));
    }

    [Fact]
    public async Task PredictEndpoint_WhitespaceAndControlCharOnlyInput_ReturnsBadRequestSafely()
    {
        // [TC-BE-INF-22] Chuẩn ISO 29119-4 (Boundary / Fault Tolerance - Từ chối bình luận rỗng chứa ký tự điều khiển tại InferenceController)
        // 1. Arrange (Chuẩn bị): Khởi tạo InferenceController với FakeInferenceService trên RAM
        var controller = new InferenceController(
            new FakeInferenceService(),
            scopeFactory: null!,
            NullLogger<InferenceController>.Instance);

        // 2. Act (Thực thi): Gửi payload chỉ gồm khoảng trắng, tab và xuống dòng
        var actionResult = await controller.Predict(new PredictRequest { Text = "   \t\r\n   " });

        // 3. Assert (Kiểm chứng): Controller trả HTTP 400 BadRequest an toàn, không gọi AI inference
        Assert.IsType<BadRequestObjectResult>(actionResult);
    }
}
