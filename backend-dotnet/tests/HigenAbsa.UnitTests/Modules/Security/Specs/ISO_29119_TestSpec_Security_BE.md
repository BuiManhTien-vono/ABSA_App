# Đặc tả Kiểm thử Backend — Mục 1: Tài khoản & Bảo mật (Security BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.Security`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3:** Cấu trúc đặc tả ca kiểm thử (`Test Case Specification`).
  - **ISO/IEC/IEEE 29119-4:** Kỹ thuật thiết kế ca kiểm thử (Hộp đen, Hộp trắng, Giá trị biên, Chuyển trạng thái, Đoán lỗi).
  - **ISO/IEC 25010:2023:** Tiêu chí chất lượng (`Security`: Confidentiality, Integrity, Authenticity, Accountability, Resistance; `Functional Suitability`; `Maintainability`).
  - **OWASP WSTG v4.2 (Mục 4.4 Authentication & 4.5 Authorization Testing)** & **IETF OAuth 2.0 Security BCP**.
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_Security_BE.md`: Đặc tả 32 ca kiểm thử chuẩn ISO (gồm 21 ca đạt chuẩn và 11 ca TDD nghiêm ngặt theo chuẩn ISO/OWASP).
  - `Fixtures/SecurityTestContext.cs`: Môi trường CSDL In-Memory cô lập trên RAM (`Guid` riêng cho từng ca test).
  - `Services/AuthenticationTests.cs`, `PasswordAndAccountTests.cs`, `JwtTokenServiceTests.cs`: 32 kịch bản tự động theo mô hình 3 bước AAA (`Arrange - Act - Assert`).

---

## 1. Ma trận Đặc tả 32 Ca kiểm thử Backend trên RAM

### Nhóm 1.1: Đăng ký, Đăng nhập, Phiên & Xoay vòng Token (`Services/AuthenticationTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Chuẩn tham chiếu | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SEC-01** | `RegisterAsync_ValidNewUser_CreatesAccountWithHashedPasswordAndTokens` | Security · Functional Suitability | OWASP WSTG-ATHN-07 · Microsoft AAA | Nhập email có dấu cách + chữ hoa $\rightarrow$ lưu chữ thường đã `Trim()`, gán `STORE_MANAGER`, băm BCrypt (`PasswordHash != Password`), trả đủ `AccessToken` & `RefreshToken`. |
| **TC-BE-SEC-02** | `RegisterAsync_DuplicateEmailDifferentCase_ThrowsInvalidOperationException` | Functional Suitability | ISO 29119-4 (Equivalence) | Đăng ký lại email chỉ khác chữ hoa/thường $\rightarrow$ ném `InvalidOperationException` (`"Email address is already registered."`). |
| **TC-BE-SEC-03** | `LoginAsync_ValidCredentials_ReturnsAccessAndRefreshTokens` | Security (Authenticity) | OWASP WSTG-ATHN-01 | Đăng nhập đúng mật khẩu $\rightarrow$ trả về `AccessToken` (3600s), `RefreshToken` lưu DB kèm IP người dùng (`192.168.1.50`). |
| **TC-BE-SEC-04** | `LoginAsync_WrongPassword_ThrowsUnauthorizedWithGenericMessage` | Security (Resistance) | OWASP WSTG-ATHN-02 (Account Enumeration) | Nhập sai mật khẩu $\rightarrow$ ném `UnauthorizedAccessException` với thông báo chung `"Invalid email or password."`. |
| **TC-BE-SEC-05** | `LoginAsync_NonExistentEmail_ThrowsUnauthorizedWithSameGenericMessage` | Security (Resistance) | OWASP WSTG-ATHN-02 (Account Enumeration) | Nhập email chưa từng tồn tại $\rightarrow$ trả về **cùng thông báo** `"Invalid email or password."` giống hệt TC-BE-SEC-04. |
| **TC-BE-SEC-06** | `LoginAsync_DeactivatedAccount_ThrowsUnauthorizedAccessException` | Security (Access Control) | OWASP WSTG-ATHN-03 | Tài khoản `IsActive = false` $\rightarrow$ từ chối đăng nhập dù đúng mật khẩu (`"Account is deactivated. Contact administrator."`). |
| **TC-BE-SEC-07** | `RefreshTokenAsync_ValidActiveToken_RotatesTokenAndRevokesOldToken` | Security (Integrity) | IETF OAuth 2.0 Security BCP | Gửi `RefreshToken` hợp lệ $\rightarrow$ cấp `RefreshToken` mới, thu hồi token cũ (`IsRevoked = true`) và ghi `ReplacedByToken`. |
| **TC-BE-SEC-08** | `RefreshTokenAsync_AlreadyRevokedToken_ThrowsUnauthorizedAccessException` | Security (Resistance) | IETF OAuth 2.0 Security BCP | Gửi lại `RefreshToken` đã thu hồi $\rightarrow$ từ chối bằng `UnauthorizedAccessException` (`"Invalid or expired refresh token."`). |
| **TC-BE-SEC-09** | `LogoutAsync_ExistingRefreshToken_MarksTokenAsRevoked` | Security (Accountability) | OWASP Session Management | Gọi `LogoutAsync` $\rightarrow$ trả về `true`, đánh dấu `IsRevoked = true`, lưu `RevokedAt` và `RevokedByIp`. |
| **TC-BE-SEC-16** | `RegisterAsync_ClientSuppliesAdminRole_EnforcesDefaultStoreManagerAndPreventsPrivilegeEscalation` | Security (Confidentiality & Integrity) | OWASP WSTG-ATHZ-02 (Privilege Escalation) · ISO TDD | Client cố tình truyền `Role = "ADMIN"` qua luồng đăng ký công khai $\rightarrow$ Hệ thống bắt buộc ép về `"STORE_MANAGER"` (hoặc từ chối), tuyệt đối không cấp quyền `ADMIN`. |
| **TC-BE-SEC-17** | `RegisterAsync_DuplicateEmailWithSurroundingWhitespace_ThrowsInvalidOperationException` | Functional Suitability · Integrity | ISO 29119-4 (Boundary / Normalization) · ISO TDD | Email `"user@shop.vn"` đã tồn tại, đăng ký tiếp `"  user@shop.vn  "` có khoảng trắng bao quanh $\rightarrow$ phải chuẩn hóa `Trim()` trước khi so khớp và ném `InvalidOperationException`. |
| **TC-BE-SEC-18** | `RefreshTokenAsync_ReusingRevokedToken_RevokesDescendantActiveTokensForUser` | Security (Resistance & Integrity) | IETF OAuth 2.0 Security BCP (Token Replay Detection) · ISO TDD | Khi một `RefreshToken` cũ đã thu hồi bị đem ra dùng lại (dấu hiệu lộ token) $\rightarrow$ ngoài việc ném lỗi `UnauthorizedAccessException`, hệ thống phải thu hồi toàn bộ chuỗi token con đang hoạt động của user đó. |
| **TC-BE-SEC-19** | `RegisterAsync_PasswordShorterThanMinimumBoundary_ThrowsArgumentOrInvalidOperationException` | Security · Reliability | ISO 29119-4 (Boundary Value `< 6` ký tự) · OWASP WSTG-ATHN-07 · ISO TDD | Truyền mật khẩu 5 ký tự (`"12345"`) vào tầng dịch vụ `RegisterAsync` $\rightarrow$ tầng Domain/Service phải chặn ngay bằng ngoại lệ, không cho phép băm mật khẩu yếu lưu vào DB. |

### Nhóm 1.2: Mật khẩu & Quản lý tài khoản (`Services/PasswordAndAccountTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Chuẩn tham chiếu | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SEC-10** | `ChangePasswordAsync_CorrectCurrentPassword_UpdatesPasswordHash` | Security (Authenticity) | OWASP WSTG-ATHN-09 | Đổi mật khẩu khi nhập đúng mật khẩu cũ $\rightarrow$ cập nhật mã băm mới; mật khẩu cũ bị từ chối, mật khẩu mới đăng nhập thành công. |
| **TC-BE-SEC-11** | `ChangePasswordAsync_WrongCurrentPassword_ThrowsUnauthorizedAccessException` | Security (Integrity) | OWASP WSTG-ATHN-09 | Nhập sai mật khẩu hiện tại $\rightarrow$ ném `UnauthorizedAccessException` và giữ nguyên `PasswordHash` cũ trong DB. |
| **TC-BE-SEC-12** | `DeleteUserAsync_ExistingUser_SoftDeletesByDeactivatingAccount` | Security (Accountability) | Audit Trail / Soft Delete | Xóa nhân viên $\rightarrow$ bản ghi vẫn lưu trong DB (`IsActive = false`) để truy vết và không thể đăng nhập lại. |
| **TC-BE-SEC-13** | `GetUsersAsync_FilterByRoleAndSearch_ReturnsMatchingPagedUsers` | Functional Suitability | RBAC User Management | Lọc theo `role = "CSKH_STAFF"` và tìm kiếm theo từ khóa `"Bình"` $\rightarrow$ trả về chính xác từng bản ghi khớp và `TotalCount = 1`. |
| **TC-BE-SEC-21** | `CreateUserAsync_ValidAdminRequest_NormalizesEmailTrimsNameAndHashesPassword` | Security · Functional Correctness | ISO 25010 Management | Admin tạo nhân viên mới $\rightarrow$ chuẩn hóa `Email`, `Trim()` họ tên, băm mật khẩu BCrypt và lưu đúng vai trò được chỉ định. |
| **TC-BE-SEC-22** | `CreateUserAsync_DuplicateEmailDifferentCase_ThrowsInvalidOperationException` | Functional Integrity | ISO 29119-4 Equivalence | Admin tạo nhân viên trùng Email chỉ khác chữ hoa/thường $\rightarrow$ ném `InvalidOperationException`. |
| **TC-BE-SEC-23** | `UpdateUserAsync_RoleChangeAndDeactivation_PersistsAndBlocksSubsequentLogin` | Security (Access Control) | ISO 29119-4 State Transition | Đổi vai trò và hạ `IsActive = false` qua `UpdateUserAsync` $\rightarrow$ cập nhật DB và chặn đăng nhập ngay lập tức. |
| **TC-BE-SEC-24** | `UpdateUserAsync_NonExistentUserId_ReturnsNull` | Reliability (Fault Tolerance) | ISO 29119-4 Error Guessing | Gọi `UpdateUserAsync` với ID không tồn tại $\rightarrow$ trả về `null` an toàn không gây crash. |
| **TC-BE-SEC-25** | `SecurityUserLookupContract_GetByIdAndEmail_ReturnsExactUserContractOrNull` | Modularity · Interoperability | ISO 25010 Cross-Module | Hợp đồng `ISecurityUserLookupContract` tra cứu theo ID và Email $\rightarrow$ trả đúng `UserContractDto` hoặc `null`. |
| **TC-BE-SEC-26** | `GetProfileAsync_ExistingAndMissingUser_ReturnsProfileOrNull` | Functional Completeness | ISO 29119-4 Specification | Lấy hồ sơ người dùng theo ID hợp lệ / không tồn tại $\rightarrow$ trả đúng DTO hoặc `null`. |
| **TC-BE-SEC-27** | `ChangePasswordAsync_SameAsCurrentPassword_ThrowsArgumentOrInvalidOperationException` | Security (Resistance) | OWASP ASVS V2.1 · ISO TDD | Người dùng đổi sang mật khẩu giống hệt mật khẩu đang dùng $\rightarrow$ bắt buộc từ chối bằng ngoại lệ. |
| **TC-BE-SEC-28** | `CreateUserAsync_UnsupportedRoleValue_ThrowsArgumentException` | Security (Authorization Integrity) | ISO 29119-4 BVA · ISO TDD | Gửi giá trị `Role` ngoài danh mục cho phép (`"SUPER_HACKER"`) vào `CreateUserAsync` $\rightarrow$ ném `ArgumentException`. |
| **TC-BE-SEC-29** | `GetUsersAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds` | Reliability · Anti-DDoS | OWASP API4:2023 · BVA · ISO TDD | Truyền `page = -2`, `pageSize = 50000` $\rightarrow$ bắt buộc kẹp biên `Page >= 1` và `PageSize <= 100`. |
| **TC-BE-SEC-30** | `UserAndAuthControllers_ProtectedEndpoints_EnforceAuthorizeAndAdminRoleAttributes` | Security (Access Control) | OWASP API5:2023 | Xác minh `UserController` gắn `[Authorize(Roles = "ADMIN")]` và `Logout`/`ChangePassword` gắn `[Authorize]`. |
| **TC-BE-SEC-31** | `LoginAsync_RepeatedFailedAttempts_LocksOutAccountTemporarilyToPreventBruteForce` | Security (Resistance) | OWASP WSTG-ATHN-03 · ISO TDD | Thử sai mật khẩu 6 lần liên tiếp $\rightarrow$ tạm khóa đăng nhập chống dò mật khẩu tự động (Brute Force). |
| **TC-BE-SEC-32** | `RegisterAsync_WeakNumericOnlyPasswordAtMinLength_RequiresCharacterComplexity` | Security (Authenticity) | OWASP ASVS V2.1 · ISO TDD | Đăng ký với mật khẩu 6 chữ số toàn số (`"123456"`) $\rightarrow$ bắt buộc kiểm tra độ phức tạp. |

### Nhóm 1.3: Sinh & Xác thực chữ ký JWT (`Services/JwtTokenServiceTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Chuẩn tham chiếu | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SEC-14** | `GenerateAccessToken_ValidUser_ContainsCorrectIdentityAndRoleClaims` | Security (Authenticity) | RFC 7519 JWT | Access Token có `expiresInSeconds = 3600`, đúng Issuer/Audience và đủ claims `nameid`, `email`, `unique_name`, `role`. |
| **TC-BE-SEC-15** | `GeneratePrincipalFromExpiredToken_TamperedToken_ReturnsNull` | Security (Integrity) | RFC 7519 Signature Verification | Sửa ký tự ở chữ ký JWT $\rightarrow$ hàm `GetPrincipalFromExpiredToken` từ chối và trả về `null`. |
| **TC-BE-SEC-20** | `GetPrincipalFromExpiredToken_ValidSignedToken_ReturnsClaimsPrincipalWithUserId` | Security (Authenticity & Integrity) | RFC 7519 Issuer Validation · ISO TDD | Truyền một JWT hợp lệ do chính `JwtTokenService` ký vào `GetPrincipalFromExpiredToken` $\rightarrow$ phải xác thực đúng `ValidIssuer` và trả về `ClaimsPrincipal` khác `null` chứa đúng ` user.Id`. |
