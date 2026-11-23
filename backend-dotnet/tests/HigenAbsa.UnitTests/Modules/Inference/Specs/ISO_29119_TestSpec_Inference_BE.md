# Đặc tả Kiểm thử Backend — Mục 2: Suy luận AI & Phân tích Cảm xúc Phân cấp (Inference BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.Inference`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3:** Cấu trúc đặc tả ca kiểm thử (`Test Case Specification`).
  - **ISO/IEC/IEEE 29119-4:** Kỹ thuật thiết kế ca kiểm thử (Phân vùng tương đương, Giá trị biên, Bảng quyết định, Đoán lỗi ngôn ngữ tự nhiên).
  - **ISO/IEC 25010:2023:** Tiêu chí chất lượng (`Functional Suitability`: Functional Completeness, Correctness, Appropriateness; `Reliability`: Fault Tolerance).
  - **ISO/IEC TR 24029 (Robustness of Neural Networks / AI Systems):** Kiểm thử tính bền vững của hậu xử lý ngôn ngữ tự nhiên (NLU), ánh xạ phân cấp (`Taxonomy`) và tính ổn định số học (`Sigmoid` / `Softmax`).
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_Inference_BE.md`: Đặc tả 24 ca kiểm thử chuẩn ISO.
  - `Fixtures/InferenceTestContext.cs`: Môi trường `InferenceDbContext` In-Memory trên RAM, bộ giả lập `IInferenceService` xác định (Deterministic AI Stub) và `SpyEventBus`.
  - `Services/TextAndDomainOverrideTests.cs`, `Services/PostprocessAndExcelTests.cs`: 24 kịch bản tự động theo mô hình AAA (`Arrange - Act - Assert`).

---

## 1. Ma trận Đặc tả 24 Ca kiểm thử Backend trên RAM (`Inference`)

### Nhóm 2.1: Tiền xử lý văn bản, Toán học Xác suất & Luật Ghi đè Miền (`Services/TextAndDomainOverrideTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010 / 24029 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-INF-01** | `CleanText_ReviewPrefixAndIrregularWhitespace_NormalizesTextCorrectly` | Functional Suitability | Equivalence Partitioning | Chuỗi có tiền tố `"  Review 12 :  Sản phẩm   rất\n\t tốt  "` $\rightarrow$ cắt bỏ tiền tố `Review N:`, gộp khoảng trắng thừa thành `"Sản phẩm rất tốt"`. |
| **TC-BE-INF-02** | `ClauseSpanForMatch_VietnameseContrastConjunctions_ExtractsExactClauseBoundary` | Functional Correctness | Boundary Value Analysis | Câu ghép có từ nối tương phản `"Áo đẹp nhưng giao hàng quá chậm"` $\rightarrow$ trích xuất đúng vế `"giao hàng quá chậm"` kèm vị trí ký tự `text[Start..End] == Evidence`. |
| **TC-BE-INF-03** | `DetectDomainOverrides_CounterfeitAndBrokenSealCues_DetectsNegativeAuthenticityWithEvidence` | Functional Appropriateness | Decision Table | Bình luận có cụm `"hàng giả, seal bị bóc sẵn"` $\rightarrow$ phát hiện override `PRODUCT / Authenticity_Packaging = NEG` và gợi ý `OverallHint = NEG`. |
| **TC-BE-INF-04** | `DetectDomainOverrides_NegatedCounterfeitPhrase_ExcludesFalsePositiveNegativeOverride` | AI Robustness (ISO 24029) | Error Guessing (Phủ định) | Bình luận `"không phải hàng giả, hàng chính hãng 100%"` $\rightarrow$ bộ lọc `AuthNegExclusions` chặn báo nhầm `NEG`, gán đúng `Authenticity_Packaging = POS`. |
| **TC-BE-INF-07** | `MathHelpers_SigmoidAndSoftmax_SatisfyProbabilityAxiomsAndNumericalStability` | Reliability · Correctness | Boundary Value (Extreme Logits) | `Sigmoid(0) == 0.5`; `Softmax([1000f, 1001f, 999f])` không bị tràn số `NaN/Inf`, tổng xác suất $= 1.0$, `ArgMax` trả về đỉnh số `1`. |
| **TC-BE-INF-12** | `DetectDomainOverrides_NegatedPackagingDamagePhrase_DoesNotMisclassifyAsNegative` | AI Robustness (ISO 24029) | Error Guessing (Phủ định kép · ISO TDD) | Khách khen `"Đóng gói kỹ, hộp không bị móp chút nào"` $\rightarrow$ bộ luật `DomainOverrides` không được bắt nhầm từ khóa `"bị móp"` thành `External_Packaging = NEG`. |
| **TC-BE-INF-13** | `DetectDomainOverrides_SlowDeliveryAndRudeStaffCues_DetectsBothNegativeAspects` | Functional Correctness | Decision Table | Phát hiện đồng thời tín hiệu `"giao hàng chậm"` (`Delivery_Speed = NEG`) và `"nhân viên thô lỗ"` (`Seller_Staff_Attitude = NEG`). |
| **TC-BE-INF-14** | `DetectDomainOverrides_PositivePackagingAndFreeship_DetectsPositiveAspects` | Functional Appropriateness | Decision Table | Bắt đúng tín hiệu khen `"gói hàng kỹ, freeship"` $\rightarrow$ gán `External_Packaging = POS` và `Shipping_Fee = POS`. |
| **TC-BE-INF-15** | `DetectDomainOverrides_SpamNoiseRewardText_DetectsSpamNoiseNeutralCue` | AI Robustness (ISO 24029) | Equivalence Partitioning | Bình luận rác nhận xu `"nhận xu shopee quảng cáo"` $\rightarrow$ gắn nhãn `Spam_Noise` ở mức `NEU` để cô lập khỏi điểm sản phẩm. |
| **TC-BE-INF-16** | `ApplyHierarchyCorrection_MismatchedMacro_SynchronizesParentMacroFromTaxonomy` | Functional Integrity | Taxonomy Hierarchy Check | Khía cạnh con `Price_Value` gắn sai cha `SHIPPING` $\rightarrow$ hàm `ApplyHierarchyCorrection` tự sửa lại đúng Macro `SERVICE_OR_PRICE`. |
| **TC-BE-INF-21** | `DetectDomainOverrides_VariantNegatedPackagingAndSeal_DoesNotMisclassifyAsNegative` | AI Robustness (ISO 24029) | Error Guessing (Phủ định · ISO TDD) | Câu khen dùng biến thể phủ định `"không hề móp méo và chưa thấy rách tem hay rách seal"` $\rightarrow$ không được gán nhầm nhãn `NEG`. |
| **TC-BE-INF-22** | `PredictEndpoint_WhitespaceAndControlCharOnlyInput_ReturnsBadRequestSafely` | Reliability (Fault Tolerance) | Boundary Value Analysis | Gửi văn bản toàn khoảng trắng và ký tự điều khiển `\t\r\n` vào `InferenceController.Predict` $\rightarrow$ trả HTTP `400 BadRequest` an toàn. |

### Nhóm 2.2: Hậu xử lý Phân cấp, Sinh Insight, Event Handler & Phân tích File CSV/Excel (`Services/PostprocessAndExcelTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010 / 24029 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-INF-05** | `ApplyPostprocess_MixedPositiveAndNegativeAspects_DerivesMixedOverallAndGeneratesVietnameseInsight` | Functional Completeness | Decision Table | Có cả khía cạnh `POS` (`Appearance_Design`) và `NEG` (`Delivery_Speed`) $\rightarrow$ tự suy diễn `OverallSentiment = MIXED` (`0.8`), đồng bộ `Macros` (`PRODUCT`, `SHIPPING`) và sinh đủ 4 trường `Insight` tiếng Việt. |
| **TC-BE-INF-06** | `ApplyPostprocess_SpamAndQuestionMicros_SetsFlagsAndExcludesFromCustomerInsight` | Functional Appropriateness | Equivalence Partitioning | Khía cạnh chứa `Spam_Noise` và `Intent_QA` $\rightarrow$ bật cờ `Spam = true`, `IntentQa = true` và không đưa nhãn nhiễu vào câu tóm tắt `CustomerInsight`. |
| **TC-BE-INF-08** | `ReviewCreatedEventHandler_NegativeReview_PersistsAnalysisAndPublishesNegativeReviewDetectedEvent` | Functional Correctness | State Transition | Nhận sự kiện `ReviewCreatedIntegrationEvent` (1 sao, nội dung tiêu cực) $\rightarrow$ lưu `ReviewAIAnalysis` + `ReviewAspects` vào DB RAM và phát sự kiện `NegativeReviewDetectedIntegrationEvent` với `Priority = "HIGH"`. |
| **TC-BE-INF-09** | `ReviewCreatedEventHandler_DuplicateReviewId_IsIdempotentAndDoesNotDuplicateAnalysis` | Reliability (Idempotency) | State Transition | Gửi lặp 2 lần cùng `ReviewId` vào `ReviewCreatedEventHandler` $\rightarrow$ chỉ lưu đúng 1 bản ghi `ReviewAIAnalysis` trong DB, không phát sự kiện trùng lặp. |
| **TC-BE-INF-10** | `ProcessExcelStreamAsync_ValidVietnameseCsvStream_AnalyzesRowsPersistsToDbAndComputesAspectSummary` | Functional Completeness | Specification-Based | Tải luồng CSV có cột tiếng Việt (`Nội dung đánh giá,Sản phẩm,Khách hàng,Số sao`), bỏ qua dòng rác `< 3` ký tự, tính đúng `PositivePercentage`, `NegativeCount` và lưu vào DB. |
| **TC-BE-INF-11** | `ProcessExcelStreamAsync_EmptyOrHeaderOnlyCsvStream_ThrowsInvalidOperationException` | Reliability (Fault Tolerance) | Boundary Value Analysis | File CSV rỗng hoặc chỉ có dòng tiêu đề không có bình luận hợp lệ $\rightarrow$ ném `InvalidOperationException` rõ ràng, không ghi dữ liệu rác vào DB. |
| **TC-BE-INF-17** | `RemoveUnfoundedSpecialAspects_NullEvidenceAndApologyPerformance_RemovesSpuriousAspects` | AI Robustness (ISO 24029) | Rule Filtering | Loại bỏ các khía cạnh đặc biệt sinh nhầm (không có bằng chứng hoặc câu xin lỗi vô nghĩa) khỏi kết quả cuối cùng. |
| **TC-BE-INF-18** | `ProcessExcelStreamAsync_EnglishCsvColumnsWithSaveToDbFalse_DoesNotPersistRows` | Interoperability · Isolation | Specification-Based | Hỗ trợ tên cột CSV tiếng Anh (`comment,rating,product`) với cờ `saveToDb = false` $\rightarrow$ trả đúng kết quả nhưng DB giữ `0` bản ghi. |
| **TC-BE-INF-19** | `ProcessExcelStreamAsync_UnsupportedFileExtension_ThrowsInvalidOperationException` | Reliability (Fault Tolerance) | Error Guessing · ISO TDD | Tải lên định dạng file không được hỗ trợ (`.txt`) $\rightarrow$ phải từ chối bằng `InvalidOperationException` thay vì làm văng lỗi `HeaderException` từ thư viện lõi. |
| **TC-BE-INF-20** | `InferenceLookupService_AnalyzedAndMissingReview_ReturnsContractDtoOrNull` | Modularity · Interoperability | ISO 25010 Cross-Module | Hợp đồng `IInferenceLookupContract` trả chính xác `InferenceSummaryContractDto` (hoặc `null` nếu chưa phân tích). |
| **TC-BE-INF-23** | `ProcessExcelStreamAsync_ExcessiveRowCountAboveAntiDoSLimit_ThrowsInvalidOperationException` | Reliability · Anti-DDoS | OWASP API4:2023 · ISO TDD | Tải lên file CSV chứa `2,500` dòng vượt trần chống quá tải AI $\rightarrow$ phải từ chối bằng `InvalidOperationException`. |
| **TC-BE-INF-24** | `InferenceController_Endpoints_RequireAuthorizeAndCapBatchSizeForAntiDoS` | Security · Anti-DDoS | OWASP API1/API4 · ISO TDD | Xác minh endpoint `/predict`, `/upload-excel` có `[Authorize]` và `PredictBatch` chặn mảng 250 câu vượt ngưỡng. |
