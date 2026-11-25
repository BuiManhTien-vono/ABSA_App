# Đặc tả Kiểm thử Backend — Mục 5: Báo cáo Thống kê Dashboard & Nhật ký Truy vết (Reporting BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.Reporting`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3 & 29119-4:** Đặc tả ca kiểm thử & Kỹ thuật thiết kế (Giá trị biên CSDL rỗng chống chia cho 0, Phân vùng theo ngày/tuần/tháng, Kiểm tra bất biến tổng hợp).
  - **ISO/IEC 25010:2023:** `Functional Correctness` (Độ chính xác số liệu KPI, phần trăm cảm xúc, đột biến tiêu cực), `Security - Accountability` (Truy vết nhật ký `AuditLog`), `Data Integrity` (Không đếm trùng số lượng đánh giá trong bảng tổng hợp ngày).
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_Reporting_BE.md`: Đặc tả 20 ca kiểm thử chuẩn ISO.
  - `Fixtures/ReportingTestContext.cs`: Môi trường `ReportingDbContext` In-Memory trên RAM kèm bộ giả lập `IUserLookupContract`.
  - `Services/DashboardAnalyticsTests.cs`, `Services/AuditAndEventHandlersTests.cs`: 20 kịch bản tự động theo mô hình AAA.

---

## 1. Ma trận Đặc tả 20 Ca kiểm thử Backend trên RAM (`Reporting`)

### Nhóm 5.1: Thống kê KPI, Xu hướng Cảm xúc, Phân bổ Sàn & Đột biến Tiêu cực (`Services/DashboardAnalyticsTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-REP-01** | `GetKpiAsync_EmptyDatabase_ReturnsZeroedMetricsWithoutDivisionByZero` | Reliability (Fault Tolerance) | Boundary Value (0 records) | CSDL hoàn toàn trống (`0` đánh giá, `0` phân tích) $\rightarrow$ `GetKpiAsync` trả về `0` cho mọi chỉ số và phần trăm, không phát sinh lỗi chia cho 0 hoặc `NaN`. |
| **TC-BE-REP-02** | `GetKpiAsync_PopulatedData_CalculatesAccuratePercentagesStoreCountAndOpenTickets` | Functional Correctness | Specification-Based | Có đánh giá hôm qua/hôm nay, phân tích `POS/NEU/NEG`, gian hàng `CONNECTED/DISCONNECTED` và Ticket `OPEN/IN_PROGRESS/RESOLVED` $\rightarrow$ tính chính xác `TodayChangePercent`, `PosPercent`, `ConnectedStores` và `OpenTickets`. |
| **TC-BE-REP-03** | `GetSentimentTrendAsync_GroupByDayAndMonth_AggregatesChronologically` | Functional Correctness | Equivalence Partitioning | Nhóm xu hướng theo `"day"` và `"month"` $\rightarrow$ gom đúng số lượng `PosCount`, `NeuCount`, `NegCount`, `TotalCount` và sắp xếp tăng dần theo thời gian. |
| **TC-BE-REP-04** | `GetPlatformDistributionAsync_MultiplePlatforms_CalculatesAccurateReviewCountsAndPercentages` | Functional Correctness | Math Invariant | Có 4 đánh giá (2 Shopee, 1 Lazada, 1 TikTok Shop) $\rightarrow$ trả về tỷ lệ phần trăm chính xác (`50%`, `25%`, `25%`), sắp xếp giảm dần theo số lượng. |
| **TC-BE-REP-05** | `GetNegativeSpikesAsync_ProductsWithNegativeReviews_RanksTopNegativeProductsAndComputesNegPercent` | Functional Appropriateness | Specification-Based | Sản phẩm A có `3/4` đánh giá `NEG` (`75%`), Sản phẩm B có `1/2` đánh giá `NEG` (`50%`) trong 7 ngày qua $\rightarrow$ xếp Sản phẩm A lên đầu danh sách cảnh báo kèm đúng `NegPercent = 75`. |
| **TC-BE-REP-06** | `GetAspectSummaryAsync_FilterByStoreId_AggregatesMacroMicroMentionsIsolatedByStore` | Functional Correctness · Isolation | Equivalence Partitioning | Lọc `GetAspectSummaryAsync(storeA)` khi có dữ liệu của cả `storeA` và `storeB` $\rightarrow$ chỉ tổng hợp đúng lượt nhắc `Positive/Neutral/Negative` của các đánh giá thuộc `storeA`. |
| **TC-BE-REP-09** | `GetSentimentTrendAsync_EmptyDateRange_ReturnsEmptyListWithoutException` | Reliability (Fault Tolerance) | Boundary Value (Empty) | Truy vấn xu hướng cảm xúc với khung ngày trống không có đánh giá $\rightarrow$ trả về danh sách rỗng an toàn. |
| **TC-BE-REP-10** | `GetRecentReviewsAsync_CountAbove50AndBelow1_ClampsSafeBoundsBetween1And50` | Reliability (Boundary Guard) | Boundary Value Analysis | Truyền `count = 999` hoặc `-5` vào `GetRecentReviewsAsync` $\rightarrow$ tự kẹp biên an toàn trong khoảng `[1..50]`. |
| **TC-BE-REP-11** | `GetKpiAsync_DateRangeWindow_ExcludesReviewsAndAnalysesOutsideWindow` | Functional Correctness | Equivalence Partitioning | Lọc KPI theo cửa sổ `from..to` $\rightarrow$ loại bỏ chính xác các đánh giá nằm ngoài khung ngày chọn. |
| **TC-BE-REP-12** | `GetNegativeSpikesAsync_NegativeDaysAndPositiveOnlyProduct_ClampsLookbackAndExcludesNonNegative` | Functional Appropriateness | Boundary Value Analysis | Tham số `days < 1` được tự nâng về tối thiểu an toàn và sản phẩm chỉ toàn khen (`0 NEG`) bị loại khỏi danh sách cảnh báo điểm nóng. |
| **TC-BE-REP-17** | `DashboardController_MustRequireAuthorizeInsteadOfAllowAnonymous` | Security (Access Control) | OWASP API1/API3 · ISO TDD | Xác minh `DashboardController` phải gắn `[Authorize]` thay vì để lộ dữ liệu kinh doanh cho truy cập ẩn danh `[AllowAnonymous]`. |
| **TC-BE-REP-18** | `GetNegativeSpikesAsync_ExcessiveLookbackDays_ClampsWindowToAntiDoSMaximum` | Reliability · Anti-DDoS | OWASP API4:2023 · ISO TDD | Truyền `days = 36500` (100 năm) $\rightarrow$ phải kẹp trần cửa sổ truy vấn tối đa `<= 365` ngày để tránh quét toàn lịch sử. |

### Nhóm 5.2: Nhật ký Truy vết Bảo mật & Bộ lắng nghe Sự kiện Tổng hợp Ngày (`Services/AuditAndEventHandlersTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-REP-07** | `AuditLogService_LogAndFilterByActionUserAndEntity_PersistsAndFiltersAuditTrail` | Security (Accountability) | Specification-Based | Ghi nhật ký qua `UserAuditEventHandler` và `LogAsync` $\rightarrow$ chuẩn hóa `Action` thành chữ in hoa, gắn đúng tên người dùng từ `IUserLookupContract` và lọc chính xác theo `action`, `userId`, `entityName`. |
| **TC-BE-REP-08** | `ReportingEventHandlers_MultipleAnalyzedReviewsInSameDay_MaintainsConsistentTotalEqualsSumOfSentiments` | Data Integrity | Invariant Check · ISO TDD | Khi xử lý liên tiếp các sự kiện đánh giá được AI phân tích trong cùng 1 ngày $\rightarrow$ bản ghi `DailyPlatformSummary` phải đảm bảo bất biến `TotalReviews == PositiveCount + NeutralCount + NegativeCount`. |
| **TC-BE-REP-13** | `ReportingReviewCreatedEventHandler_MultipleReviewsSameDay_IncrementsTotalReviewsProjection` | Functional Correctness | Event Projection Check | Xử lý nhiều sự kiện `ReviewCreatedIntegrationEvent` trong cùng một ngày $\rightarrow$ bộ đếm `TotalReviews` cộng dồn tăng đúng số lượng. |
| **TC-BE-REP-14** | `ReportingEventHandlers_CreatedThenAnalyzedSameDay_MaintainsConsistentTotalEqualsSum` | Data Integrity | Sequential Event Flow | Sự kiện `Created` rồi `Analyzed` nối tiếp trong cùng ngày $\rightarrow$ bản ghi ngày khớp tổng `Positive + Neutral + Negative`. |
| **TC-BE-REP-15** | `AuditLogService_PaginationAndDateRangeFilter_ReturnsDescendingChronologicalPage` | Accountability · Correctness | Equivalence Partitioning | Truy vấn `AuditLog` theo phân trang & khoảng ngày $\rightarrow$ trả về đúng trang theo thứ tự mới nhất giảm dần. |
| **TC-BE-REP-16** | `AuditLogService_UnknownUserId_PreservesAuditRecordWithNullUserName` | Accountability · Fault Tolerance | Error Guessing | Nhật ký của `UserId` không còn tồn tại trong tra cứu vẫn được bảo toàn với `UserName = null` thay vì làm lỗi truy vấn. |
| **TC-BE-REP-19** | `AuditLogService_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds` | Reliability · Anti-DDoS | OWASP API4:2023 · ISO TDD | Gửi `page = -3`, `pageSize = 50000` vào `GetAuditLogsAsync` $\rightarrow$ bắt buộc kẹp biên `Page >= 1` và `PageSize <= 100`. |
| **TC-BE-REP-20** | `AuditLogController_Endpoints_EnforceAdminRoleAuthorization` | Security (Accountability) | OWASP API5:2023 | Xác minh `AuditLogController` bắt buộc `[Authorize(Roles = "ADMIN")]` và không có `[AllowAnonymous]`. |
