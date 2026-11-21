# Đặc tả Kiểm thử Backend — Mục 1: Tài khoản & Bảo mật (Security BE)

- **Hệ thống:** HIGEN-ABSA Backend (`.NET 10` Modular Monolith — `HigenAbsa.Modules.Security`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3:** Cấu trúc đặc tả ca kiểm thử (`Test Case Specification`).
  - **ISO/IEC/IEEE 29119-4:** Kỹ thuật thiết kế ca kiểm thử (Hộp đen, Hộp trắng, Đoán lỗi).
  - **ISO/IEC 25010:2023:** Tiêu chí chất lượng (`Security`: Confidentiality, Integrity, Authenticity, Accountability, Resistance; `Functional Suitability`; `Maintainability`).
  - **OWASP WSTG v4.2 (Mục 4.4 Authentication Testing)** & **IETF OAuth 2.0 Security BCP**.
- **Cấu trúc đối xứng 3 ngăn (SOTA):**
  - `Specs/ISO_29119_TestSpec_Security_BE.md`: Đặc tả ca kiểm thử chuẩn ISO.
  - `Fixtures/SecurityTestContext.cs`: Môi trường CSDL In-Memory cô lập trên RAM (`Guid` riêng cho từng ca test).
  - `Services/AuthenticationTests.cs`, `PasswordAndAccountTests.cs`, `JwtTokenServiceTests.cs`: 15 kịch bản tự động theo mô hình 3 bước AAA (`Arrange - Act - Assert`).

---

## 1. Ma trận Đặc tả 15 Ca kiểm thử Backend trên RAM

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

### Nhóm 1.2: Mật khẩu & Quản lý tài khoản (`Services/PasswordAndAccountTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Chuẩn tham chiếu | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SEC-10** | `ChangePasswordAsync_CorrectCurrentPassword_UpdatesPasswordHash` | Security (Authenticity) | OWASP WSTG-ATHN-09 | Đổi mật khẩu khi nhập đúng mật khẩu cũ $\rightarrow$ cập nhật mã băm mới; mật khẩu cũ bị từ chối, mật khẩu mới đăng nhập thành công. |
| **TC-BE-SEC-11** | `ChangePasswordAsync_WrongCurrentPassword_ThrowsUnauthorizedAccessException` | Security (Integrity) | OWASP WSTG-ATHN-09 | Nhập sai mật khẩu hiện tại $\rightarrow$ ném `UnauthorizedAccessException` và giữ nguyên `PasswordHash` cũ trong DB. |
| **TC-BE-SEC-12** | `DeleteUserAsync_ExistingUser_SoftDeletesByDeactivatingAccount` | Security (Accountability) | Audit Trail / Soft Delete | Xóa nhân viên $\rightarrow$ bản ghi vẫn lưu trong DB (`IsActive = false`) để truy vết và không thể đăng nhập lại. |
| **TC-BE-SEC-13** | `GetUsersAsync_FilterByRoleAndSearch_ReturnsMatchingPagedUsers` | Functional Suitability | RBAC User Management | Lọc theo `role = "CSKH_STAFF"` và tìm kiếm theo từ khóa `"Bình"` $\rightarrow$ trả về chính xác từng bản ghi khớp và `TotalCount = 1`. |

### Nhóm 1.3: Sinh & Xác thực chữ ký JWT (`Services/JwtTokenServiceTests.cs`)

| Mã TC | Tên hàm kiểm thử | Tiêu chí ISO 25010:2023 | Chuẩn tham chiếu | Tóm tắt Đầu vào & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BE-SEC-14** | `GenerateAccessToken_ValidUser_ContainsCorrectIdentityAndRoleClaims` | Security (Authenticity) | RFC 7519 JWT | Access Token có `expiresInSeconds = 3600`, đúng Issuer/Audience và đủ claims `nameid`, `email`, `unique_name`, `role`. |
| **TC-BE-SEC-15** | `GeneratePrincipalFromExpiredToken_TamperedToken_ReturnsNull` | Security (Integrity) | RFC 7519 Signature Verification | Sửa ký tự ở chữ ký JWT $\rightarrow$ hàm `GetPrincipalFromExpiredToken` từ chối và trả về `null`. |

---

## 2. Phát hiện lỗi thực tế từ bước rà soát mã nguồn BE (Static QA Audit)

1. **`BE-BUG-01` (Critical — Privilege Escalation):** Trong `AuthService.cs` (dòng 66), API công khai `RegisterAsync` cho phép client tự truyền `Role` (ví dụ `"ADMIN"`) thay vì ép cứng quyền mặc định `STORE_MANAGER`.
2. **`BE-BUG-02` (Medium — Input Normalization):** Trong `AuthService.cs` (dòng 53), kiểm tra trùng Email chỉ gọi `ToLower()` mà quên `Trim()`, trong khi lúc lưu ở dòng 62 lại có `Trim()`.
3. **`BE-BUG-03` (High — Token Reuse Detection & `ValidIssuer`):** Trong `AuthService.cs` (dòng 144), khi `RefreshToken` đã thu hồi bị dùng lại, hệ thống mới từ chối đơn lẻ chứ chưa thu hồi toàn bộ phiên của user theo tài liệu nghiệp vụ. Ngoài ra `JwtTokenService.cs` (dòng 83) bật `ValidateIssuer = true` nhưng quên gán `ValidIssuer = _issuer`.
