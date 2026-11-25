# Đặc tả Kiểm thử Backend — Mục 4: Quản lý Khiếu nại Ticket CSKH & Tự động Phản hồi (Engagement BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.Engagement`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3 & 29119-4:** Đặc tả ca kiểm thử & Kỹ thuật thiết kế (Chuyển đổi trạng thái Kanban `OPEN -> IN_PROGRESS -> RESOLVED -> OPEN`, Giá trị biên `MinRating..MaxRating`, Bảng quyết định).
  - **ISO/IEC 25010:2023:** `Functional Suitability`, `Reliability` (Idempotency khi nhận sự kiện Event Bus), `Integrity` (Tính nhất quán trạng thái và mốc thời gian `ResolvedAt`).
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_Engagement_BE.md`: Đặc tả 22 ca kiểm thử chuẩn ISO.
  - `Fixtures/EngagementTestContext.cs`: Môi trường `EngagementDbContext` In-Memory trên RAM kèm bộ giả lập 4 hợp đồng tra cứu liên module (`IUserLookupContract`, `IStoreLookupContract`, `IReviewLookupContract`, `IInferenceLookupContract`).
  - `Services/TicketWorkflowTests.cs`, `Services/ResponseAndAutomationTests.cs`: 22 kịch bản tự động theo mô hình AAA.

---

## 1. Ma trận Đặc tả 22 Ca kiểm thử Backend trên RAM (`Engagement`)

### Nhóm 4.1: Vòng đời Ticket CSKH Kanban & Sự kiện Khiếu nại (`Services/TicketWorkflowTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-ENG-01** | `NegativeReviewDetectedEventHandler_NewNegativeReview_AutoCreatesOpenTicketWithIdempotency` | Functional Suitability · Reliability | State Transition | Nhận sự kiện `NegativeReviewDetectedIntegrationEvent` $\rightarrow$ tự động mở Ticket trạng thái `"OPEN"`; nếu sự kiện phát lặp lần 2 với cùng `ReviewId` thì không tạo Ticket trùng. |
| **TC-BE-ENG-02** | `AssignTicketAsync_OpenTicketAndValidUser_TransitionsToInProgressAndSetsAssignee` | Functional Correctness | State Transition | Phân công một Ticket đang `"OPEN"` cho nhân viên CSKH hợp lệ $\rightarrow$ tự động chuyển trạng thái sang `"IN_PROGRESS"`, gán `AssignedToUserId` và trả về tên nhân viên. |
| **TC-BE-ENG-03** | `AssignTicketAsync_NonExistentUser_ThrowsInvalidOperationException` | Reliability (Fault Tolerance) | Error Guessing | Phân công Ticket cho `userId` không tồn tại trong `IUserLookupContract` $\rightarrow$ ném `InvalidOperationException("Assigned user not found.")`. |
| **TC-BE-ENG-04** | `ResolveTicketAsync_ValidTicket_SetsStatusResolvedTrimsNotesAndRecordsTimestamp` | Functional Completeness | State Transition | Giải quyết Ticket với ghi chú `"  Đã đổi mới 1-1 cho khách  "` $\rightarrow$ đổi trạng thái thành `"RESOLVED"`, cắt khoảng trắng ghi chú và ghi nhận mốc thời gian `ResolvedAt`. |
| **TC-BE-ENG-05** | `UpdateTicketStatusAsync_ReopeningResolvedTicket_ClearsResolvedAtTimestamp` | Data Integrity | State Transition · ISO TDD | Một Ticket đã `"RESOLVED"` (đã có `ResolvedAt != null`) bị mở lại sang trạng thái `"OPEN"` hoặc `"IN_PROGRESS"` $\rightarrow$ hệ thống phải xóa `ResolvedAt = null` để không làm sai lệch thống kê thời gian giải quyết. |
| **TC-BE-ENG-06** | `GetTicketStatsAsync_MultipleTicketsAcrossStatusesAndPriorities_ComputesAccurateKanbanCounters` | Functional Correctness | Specification-Based | Có 4 Ticket ở 4 trạng thái (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) với mức độ `URGENT` và `HIGH` $\rightarrow$ tính đúng số lượng từng cột Kanban, chỉ đếm `UrgentCount` cho các Ticket chưa đóng/chưa giải quyết. |
| **TC-BE-ENG-11** | `GetTicketsAsync_FilterByStatusPriorityAndAssignee_ReturnsFilteredPagedResultWithNames` | Functional Correctness | Decision Table | Lọc danh sách Ticket theo trạng thái, mức ưu tiên, người phụ trách $\rightarrow$ trả đúng danh sách phân trang kèm tên người xử lý/gian hàng. |
| **TC-BE-ENG-12** | `GetTicketByIdAsync_HydratesCrossModuleReviewInferenceStoreAndUserNames` | Modularity · Completeness | Cross-Module Hydration | Mở chi tiết Ticket $\rightarrow$ ghép nối đủ dữ liệu từ 4 phân hệ (`Review`, `Inference`, `Store`, `User`). |
| **TC-BE-ENG-13** | `ResolveTicketAsync_NonExistentTicketId_ReturnsNullSafely` | Reliability (Fault Tolerance) | Error Guessing | Giải quyết Ticket với ID không tồn tại $\rightarrow$ trả về `null` an toàn không gây lỗi 500. |
| **TC-BE-ENG-14** | `AssignTicketAsync_DeactivatedStaffAccount_ThrowsInvalidOperationException` | Security · Integrity | Access Boundary · ISO TDD | Phân công Ticket cho nhân viên CSKH có trạng thái `IsActive = false` $\rightarrow$ bắt buộc ném `InvalidOperationException` từ chối gán việc cho tài khoản đã khóa. |
| **TC-BE-ENG-19** | `GetTicketsAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds` | Reliability · Anti-DDoS | OWASP API4:2023 · ISO TDD | Gửi `page = 0`, `pageSize = 100000` vào `GetTicketsAsync` $\rightarrow$ kẹp biên an toàn `Page >= 1` và `PageSize <= 100`. |
| **TC-BE-ENG-20** | `TicketController_MustRequireAuthorizeInsteadOfAllowAnonymous` | Security (Access Control) | OWASP API1:2023 · ISO TDD | Xác minh `TicketController` phải gắn `[Authorize]` thay vì để lộ `[AllowAnonymous]`. |

### Nhóm 4.2: Mẫu câu trả lời, Quy tắc Tự động & Phản hồi Đánh giá (`Services/ResponseAndAutomationTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-ENG-07** | `CreateRuleAsync_MinRatingGreaterThanMaxRating_ThrowsArgumentOrInvalidOperationException` | Functional Integrity | Boundary Value Analysis · ISO TDD | Tạo quy tắc tự động với khoảng sao ngược `MinRating = 5, MaxRating = 1` $\rightarrow$ tầng dịch vụ phải kiểm tra bất biến `1 <= MinRating <= MaxRating <= 5` và ném ngoại lệ từ chối. |
| **TC-BE-ENG-08** | `ToggleRuleAsync_ExistingRule_FlipsIsEnabledStateBetweenTrueAndFalse` | Functional Suitability | State Transition | Gọi `ToggleRuleAsync` liên tiếp 2 lần trên một quy tắc $\rightarrow$ trạng thái `IsEnabled` đảo từ `true` sang `false` rồi quay lại `true`. |
| **TC-BE-ENG-09** | `ReviewCreatedEventHandler_MatchingActiveRuleAndTemplate_CreatesAutomaticReviewResponseOnce` | Functional Completeness · Reliability | Decision Table | Có quy tắc đang bật cho đánh giá `5 sao` gắn với mẫu phản hồi đang kích hoạt $\rightarrow$ khi nhận `ReviewCreatedIntegrationEvent` (5★) sẽ tự động tạo `ReviewResponse` loại `"AUTOMATIC"` và không tạo trùng nếu sự kiện lặp lại. |
| **TC-BE-ENG-10** | `SendManualResponseAsync_ValidRequest_PersistsTrimmedManualResponseAndReturnsHistory` | Functional Suitability | Specification-Based | Nhân viên gửi phản hồi thủ công $\rightarrow$ lưu bản ghi `ResponseType = "MANUAL"`, `Status = "SUCCESS"`, gắn tên người phản hồi và trả về đúng lịch sử theo thứ tự mới nhất. |
| **TC-BE-ENG-15** | `ResponseTemplates_CreateUpdateFilterByStoreAndDelete_FullCrudLifecycleSucceeds` | Functional Completeness | Specification-Based | Vòng đời đầy đủ Tạo / Sửa / Lọc theo Gian hàng & toàn hệ thống / Xóa mẫu câu phản hồi nhanh. |
| **TC-BE-ENG-16** | `UpdateRuleAsync_ExistingAndMissingRule_UpdatesConfigurationOrReturnsNull` | Functional Suitability | Equivalence Partitioning | Cập nhật quy tắc Auto-Reply hợp lệ hoặc trả về `null` khi ID không tồn tại. |
| **TC-BE-ENG-17** | `ReviewCreatedEventHandler_RatingOutsideRuleRangeOrDisabledRule_DoesNotAutoReply` | Functional Correctness | Decision Table | Đánh giá có số sao ngoài dải hoặc quy tắc đang tắt (`IsEnabled = false`) $\rightarrow$ tuyệt đối không tự động gửi phản hồi. |
| **TC-BE-ENG-18** | `SendManualResponseAsync_WhitespaceOnlyMessage_ThrowsArgumentException` | Integrity · Fault Tolerance | Boundary Value Analysis · ISO TDD | Gửi phản hồi chỉ chứa khoảng trắng (`"   \t\n  "`) $\rightarrow$ bắt buộc ném `ArgumentException` từ chối lưu nội dung rỗng. |
| **TC-BE-ENG-21** | `CreateRuleAsync_NegativeDelayOrOutOfRangeRatingBounds_ThrowsArgumentException` | Integrity · Boundary | Boundary Value Analysis · ISO TDD | Tạo quy tắc Auto-Reply với `MinRating = 0, MaxRating = 99, DelayMinutes = -30` $\rightarrow$ ném `ArgumentException`. |
| **TC-BE-ENG-22** | `ResponseController_MissingUserClaim_ReturnsUnauthorizedSafely` | Security (Authentication) | OWASP API2:2023 | Gọi `ResponseController.CreateTemplate` với Token thiếu claim định danh $\rightarrow$ trả HTTP `401 Unauthorized`. |
