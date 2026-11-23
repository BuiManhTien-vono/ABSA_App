# Đặc tả Kiểm thử Backend — Mục 3: Đồng bộ Gian hàng, Sản phẩm, Khách hàng & Đánh giá (CoreSync BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.CoreSync`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3 & 29119-4:** Đặc tả ca kiểm thử & Kỹ thuật thiết kế (Phân vùng tương đương, Giá trị biên, Chuyển đổi trạng thái, Đoán lỗi).
  - **ISO/IEC 25010:2023:** `Functional Suitability` (Tính chính xác của thống kê & phân trang), `Reliability` (Tính lũy đẳng khi đồng bộ/seed), `Security / Integrity` (Ràng buộc miền dữ liệu).
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_CoreSync_BE.md`: Đặc tả 22 ca kiểm thử chuẩn ISO.
  - `Fixtures/CoreSyncTestContext.cs`: Môi trường `CoreSyncDbContext` In-Memory trên RAM có sẵn 4 sàn (`SHOPEE`, `LAZADA`, `TIKI`, `TIKTOK_SHOP`) và stub `IInferenceLookupContract`.
  - `Services/StoreAndCatalogTests.cs`, `Services/ReviewAndCustomerTests.cs`: 22 kịch bản kiểm thử theo mô hình AAA.

---

## 1. Ma trận Đặc tả 22 Ca kiểm thử Backend trên RAM (`CoreSync`)

### Nhóm 3.1: Quản lý Gian hàng đa sàn & Thống kê Sản phẩm (`Services/StoreAndCatalogTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-CORE-01** | `CreateStoreAsync_ValidPlatformAndUniqueCode_CreatesConnectedStoreWithTrimmedFields` | Functional Suitability | Specification-Based | Tạo gian hàng trên Shopee (`PlatformId = 1`) với tên & mã có khoảng trắng $\rightarrow$ chuẩn hóa `Trim()`, gán `Status = "CONNECTED"` và trả về `PlatformCode = "SHOPEE"`. |
| **TC-BE-CORE-02** | `CreateStoreAsync_DuplicateStoreCodeDifferentCaseOnSamePlatform_ThrowsInvalidOperationException` | Functional Integrity | Equivalence Partitioning · ISO TDD | Gian hàng mã `"SPE_MALL_01"` đã tồn tại trên Shopee, tạo tiếp `"spe_mall_01"` (khác chữ hoa/thường) $\rightarrow$ phải coi là trùng mã trên cùng sàn và ném `InvalidOperationException`. |
| **TC-BE-CORE-03** | `CreateStoreAsync_NonExistentPlatformId_ThrowsInvalidOperationException` | Reliability (Fault Tolerance) | Error Guessing | Truyền `PlatformId = 999` không tồn tại $\rightarrow$ ném `InvalidOperationException("Platform with ID 999 not found.")`. |
| **TC-BE-CORE-04** | `SyncStoreAsync_ExistingStore_UpdatesLastSyncedAtTimestamp` | Functional Correctness | State Transition | Gọi `SyncStoreAsync` cho gian hàng đang kết nối $\rightarrow$ cập nhật `LastSyncedAt` sang thời điểm UTC mới nhất. |
| **TC-BE-CORE-05** | `GetProductSentimentSummaryAsync_ProductWithMixedReviews_ComputesAccurateAverageRatingAndPercentages` | Functional Correctness | Boundary & Math Check | Sản phẩm có 4 đánh giá (5★, 4★, 3★, 1★) $\rightarrow$ `AverageRating = 3.3`, `PosCount = 2` (`50%`), `NeuCount = 1` (`25%`), `NegCount = 1` (`25%`). |
| **TC-BE-CORE-11** | `LazadaSignatureService_GenerateSign_ComputesDeterministicHmacSha256ExcludingSignKey` | Security · Interoperability | Cryptographic Spec | Tạo chữ ký HMAC-SHA256 Lazada API: sắp xếp tham số theo alphabet, loại bỏ khóa `sign`, đảm bảo kết quả hex in hoa cố định. |
| **TC-BE-CORE-12** | `LazadaAuthService_GetAuthorizationUrl_EncodesCallbackClientIdAndState` | Interoperability | Specification-Based | Sinh URL OAuth2 ủy quyền Lazada $\rightarrow$ mã hóa đúng `redirect_uri`, `client_id` và `state` bảo mật. |
| **TC-BE-CORE-13** | `UpdateStoreAsync_ExistingAndMissingStore_UpdatesTrimmedFieldsOrReturnsNull` | Functional Completeness | Equivalence Partitioning | Cập nhật gian hàng tồn tại (`Trim()` tên/URL) hoặc trả về `null` khi ID không tồn tại. |
| **TC-BE-CORE-14** | `DeleteStoreAsync_ExistingAndMissingStore_RemovesFromDbAndReturnsBoolean` | Functional Suitability | Specification-Based | Xóa gian hàng khỏi DB $\rightarrow$ trả về `true` khi xóa thành công và `false` khi ID không có. |

### Nhóm 3.2: Truy vấn Đánh giá, Phân loại Rủi ro Khách hàng & Idempotency (`Services/ReviewAndCustomerTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-CORE-06** | `GetReviewsAsync_FilterBySentiment_ReturnsConsistentTotalCountAndFilteredItems` | Functional Correctness | Data Consistency · ISO TDD | DB có 3 đánh giá (2 `POS`, 1 `NEG`), lọc theo `sentiment = "NEG"` $\rightarrow$ danh sách `Items` trả về 1 bản ghi và `TotalCount` của phân trang cũng bắt buộc phải bằng `1` (không được trả `TotalCount = 3` chưa lọc). |
| **TC-BE-CORE-07** | `UpdateReviewStatusAsync_InvalidDomainStatus_ThrowsArgumentOrInvalidOperationException` | Integrity · Reliability | Boundary / Domain Rule · ISO TDD | Gọi `UpdateReviewStatusAsync` với trạng thái ngoài tập hợp lệ (`"HACKED_STATUS"` không thuộc `PENDING/REPLIED/FAILED/SKIPPED`) $\rightarrow$ tầng Service phải ném ngoại lệ từ chối. |
| **TC-BE-CORE-08** | `GetCustomerByIdAsync_CustomerWithMultipleReviews_ComputesAccurateRatingBreakdown` | Functional Correctness | Specification-Based | Khách hàng có 3 đánh giá (5★, 3★, 2★) $\rightarrow$ trả về `TotalReviewsCount = 3`, `AverageRating = 3.3`, `PosCount = 1`, `NeuCount = 1`, `NegCount = 1`. |
| **TC-BE-CORE-09** | `UpdateRiskLevelAsync_ValidRiskLevel_UpdatesCustomerRiskLevelToPotentialBommer` | Functional Suitability | State Transition | Cập nhật mức độ rủi ro khách hàng sang `"potential_bommer"` $\rightarrow$ chuẩn hóa chữ hoa `"POTENTIAL_BOMMER"` và lưu vào DB. |
| **TC-BE-CORE-10** | `SeedMockLazadaStoreAsync_CalledTwice_IsIdempotentAndDoesNotDuplicateStoreOrReviews` | Reliability (Idempotency) | State Transition | Gọi `SeedMockLazadaStoreAsync` 2 lần liên tiếp $\rightarrow$ lần 2 chỉ cập nhật `LastSyncedAt` trên gian hàng `"LAZADA_MOCK_OFFICIAL_VN"` đã có, không nhân đôi sản phẩm/đánh giá. |
| **TC-BE-CORE-15** | `GetProductsAsync_FilterByStoreAndSearchTerm_IsolatesStoreAndSkuMatches` | Functional Correctness | Equivalence Partitioning | Lọc sản phẩm theo `storeId` và từ khóa SKU/Tên $\rightarrow$ cô lập dữ liệu từng gian hàng và đếm đúng `TotalCount`. |
| **TC-BE-CORE-16** | `GetReviewByIdAsync_WithAnalyzedInference_CombinesReviewAndAiSummaryDto` | Modularity · Completeness | Cross-Module Hydration | Truy vấn chi tiết 1 đánh giá $\rightarrow$ kết hợp thông tin đánh giá từ `CoreSync` với tóm tắt cảm xúc từ `IInferenceLookupContract`. |
| **TC-BE-CORE-17** | `CoreSyncContracts_StoreAndReviewLookups_IsolateActiveStoresAndDateCount` | Modularity · Interoperability | ISO 25010 Cross-Module | Hợp đồng `IStoreLookupContract` và `IReviewLookupContract` chỉ trả về gian hàng `CONNECTED` và đếm đúng số đánh giá theo khung ngày. |
| **TC-BE-CORE-18** | `UpdateRiskLevelAsync_UnsupportedRiskLevel_ThrowsArgumentException` | Integrity · Fault Tolerance | Boundary / Domain Rule · ISO TDD | Gọi `UpdateRiskLevelAsync` với giá trị mức rủi ro rác ngoài danh mục (`"ALIEN_LEVEL"`) $\rightarrow$ bắt buộc ném `ArgumentException`. |
| **TC-BE-CORE-19** | `GetReviewsAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds` | Reliability · Anti-DDoS | OWASP API4:2023 · BVA · ISO TDD | Gửi `page = -1`, `pageSize = 50000` vào `GetReviewsAsync` $\rightarrow$ bắt buộc kẹp biên `Page >= 1` và `PageSize <= 100`. |
| **TC-BE-CORE-20** | `GetReviewsAsync_OutOfRangeRatingFilter_ThrowsArgumentOutOfRangeException` | Integrity · Fault Tolerance | Boundary Value Analysis · ISO TDD | Lọc đánh giá với `rating = 0` ngoài dải `[1..5]` $\rightarrow$ ném `ArgumentException` từ chối lọc sai miền. |
| **TC-BE-CORE-21** | `ReviewAndCustomerControllers_Endpoints_EnforceAuthorizeWithoutAllowAnonymous` | Security (Access Control) | OWASP API1:2023 | Xác minh `ReviewController` và `CustomerController` có `[Authorize]` và không có `[AllowAnonymous]`. |
| **TC-BE-CORE-22** | `GetCustomersAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds` | Reliability · Anti-DDoS | OWASP API4:2023 · ISO TDD | Gửi `page = -5`, `pageSize = 100000` vào `GetCustomersAsync` $\rightarrow$ bắt buộc kẹp biên an toàn. |
