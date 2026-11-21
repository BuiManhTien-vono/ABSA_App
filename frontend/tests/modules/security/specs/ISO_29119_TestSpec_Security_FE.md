# Đặc tả Kiểm thử Frontend — Mục 1: Tài khoản, Xác thực & Bảo mật (Security FE)

- **Hệ thống:** HIGEN-ABSA Frontend (`React 19` + `Vite 8` + `React Router 7`)
- **Tiêu chuẩn áp dụng:**
  - **ISO/IEC/IEEE 29119-3:** Cấu trúc đặc tả ca kiểm thử (`Test Case Specification`: ID, Điều kiện tiên quyết, Bước thực hiện, Đầu vào, Kết quả mong đợi).
  - **ISO/IEC/IEEE 29119-4:** Kỹ thuật thiết kế ca kiểm thử (Phân vùng tương đương, Giá trị biên, Chuyển đổi trạng thái, Đoán lỗi).
  - **ISO/IEC 25010:2023:** Tiêu chí chất lượng (`Functional Suitability`, `Security`, `Interaction Capability`, `Reliability`).
- **Phạm vi mã nguồn đối chiếu:**
  - `src/App.jsx` (`RequireAuth`, `FallbackRoute`, định tuyến `/login`, `/register`, `/users`)
  - `src/context/AuthContext.jsx` (`login`, `register`, `logout`, `saveAuth`, `clearAuth`)
  - `src/services/apiClient.js` (tự đính kèm `Bearer Token`, xử lý `401 Unauthorized`)
  - `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/pages/UsersPage.jsx`
- **Cấu trúc 3 ngăn chuẩn SOTA (`frontend/tests/`):**
  - `tests/setup.js`: Tự động xóa `localStorage`, `sessionStorage` và dọn dẹp DOM giữa các ca test.
  - `tests/modules/security/specs/ISO_29119_TestSpec_Security_FE.md`: Đặc tả ca kiểm thử chuẩn ISO.
  - `tests/modules/security/fixtures/securityTestUtils.jsx`: Test Fixture cung cấp `renderWithAuthRouter()`, `mockFetchOk()`, `mockFetchError()`.
  - `tests/modules/security/suites/LoginAndRegister.test.jsx`: 6 kịch bản (`TC-FE-SEC-01, 02, 03, 04-LOGOUT, 05, 06`).
  - `tests/modules/security/suites/SessionAndUsers.test.jsx`: 4 kịch bản (`TC-FE-SEC-08, 09, 11A, 11B`).

---

## 1. Ma trận Đặc tả Ca kiểm thử (12 Kịch bản chuẩn ISO)

### Nhóm 1.1: Đăng nhập & Quản lý phiên (`LoginPage` + `AuthContext`)

| Mã TC | Tên kịch bản | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Điều kiện tiên quyết & Đầu vào | Các bước thực hiện & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FE-SEC-01** | Đăng nhập thành công với tài khoản hợp lệ | Functional Suitability | Specification-Based (Hộp đen) | Chưa đăng nhập (`localStorage` trống).<br>Input: `email = "manager@higen.vn"`, `password = "Secret@123"`. | 1. Mở `/login`, nhập email và mật khẩu.<br>2. Bấm nút **Đăng nhập**.<br>**Mong đợi:** Gửi `POST /api/v1/auth/login`; lưu `absa_token`, `absa_refresh_token`, `absa_user` vào `localStorage`; chuyển hướng sang `/overview`. |
| **TC-FE-SEC-02** | Đăng nhập sai mật khẩu hiển thị lỗi trên giao diện | Interaction Capability · Security | Error Guessing (Đoán lỗi) | Backend trả về `401` với `{ detail: "Invalid email or password." }`. | 1. Nhập email đúng, mật khẩu sai.<br>2. Bấm **Đăng nhập**.<br>**Mong đợi:** Ở nguyên trang `/login` (không tải lại trang), hiển thị khung báo lỗi màu đỏ chứa thông báo từ server, không lưu token vào `localStorage`. |
| **TC-FE-SEC-03** | Bật/tắt hiển thị mật khẩu (Eye Toggle) | Interaction Capability (Usability) | State Transition (Chuyển trạng thái) | Đang ở trang `/login`. | 1. Nhập mật khẩu.<br>2. Bấm biểu tượng con mắt bên phải ô mật khẩu, rồi bấm lại lần 2.<br>**Mong đợi:** Lần 1 `type` của ô nhập chuyển từ `password` $\rightarrow$ `text` (hiện chữ); lần 2 chuyển lại `password` (che dấu chấm). |
| **TC-FE-SEC-04** | Chức năng "Ghi nhớ tôi" (Remember Me) & Đăng xuất | Security · Functional Suitability | Specification-Based | Đang ở `/login` hoặc đã đăng nhập có `refresh_token`. | 1. Kiểm tra đăng xuất (`TC-FE-SEC-04-LOGOUT`) gọi `/api/v1/auth/logout` và xóa sạch `localStorage`.<br>2. Kiểm tra bỏ chọn **Ghi nhớ tôi** khi đăng nhập. *(Xem lưu ý FE-BUG-04 ở Mục 2)*. |

---

### Nhóm 1.2: Đăng ký tài khoản (`RegisterPage`)

| Mã TC | Tên kịch bản | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Điều kiện tiên quyết & Đầu vào | Các bước thực hiện & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FE-SEC-05** | Đăng ký tài khoản mới hợp lệ | Functional Suitability | Specification-Based | Chưa đăng nhập, đang ở `/register`.<br>Input: Họ tên, Email mới, SĐT, Mật khẩu `>= 6` ký tự khớp với Xác nhận mật khẩu. | 1. Điền đủ thông tin hợp lệ.<br>2. Bấm **Tạo tài khoản**.<br>**Mong đợi:** Gửi `POST /api/v1/auth/register` với `role: "STORE_MANAGER"`, lưu cặp token và user vào `localStorage`, điều hướng về `/overview`. |
| **TC-FE-SEC-06** | Chặn gửi form khi mật khẩu xác nhận không khớp | Interaction Capability (User Error Protection) | Equivalence Partitioning | Đang ở `/register`.<br>Input: Mật khẩu `"Pass@123"`, Xác nhận `"Pass@456"`. | 1. Nhập 2 mật khẩu khác nhau.<br>2. Bấm **Tạo tài khoản**.<br>**Mong đợi:** Không gọi API lên Backend; hiển thị ngay thông báo `"Mật khẩu xác nhận không khớp."` trên màn hình. |
| **TC-FE-SEC-07** | Kiểm tra giá trị biên độ dài mật khẩu (`< 6` ký tự) | Interaction Capability · Reliability | Boundary Value Analysis (Giá trị biên) | Đang ở `/register`.<br>Input: Mật khẩu 5 ký tự `"12345"`. | 1. Nhập mật khẩu 5 ký tự, xác nhận `"12345"`.<br>2. Bấm **Tạo tài khoản**.<br>**Mong đợi:** Giao diện chặn hoặc hiển thị rõ ràng yêu cầu tối thiểu 6 ký tự trước khi gọi API (đồng bộ với Backend). *(Xem lưu ý FE-BUG-05 ở Mục 2)*. |

---

### Nhóm 1.3: Bảo vệ đường dẫn, Phiên hết hạn & Phân quyền (`RequireAuth` + `apiClient`)

| Mã TC | Tên kịch bản | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Điều kiện tiên quyết & Đầu vào | Các bước thực hiện & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FE-SEC-08** | Chặn truy cập trang nội bộ khi chưa đăng nhập | Security (Authenticity / Access Control) | Specification-Based | `localStorage` hoàn toàn trống. | 1. Truy cập trực tiếp URL `/overview` hoặc `/users`.<br>**Mong đợi:** Component `RequireAuth` tự động đá người dùng về `/login`. |
| **TC-FE-SEC-09** | Tự động xử lý khi Access Token hết hạn (HTTP `401`) | Security · Reliability | State Transition | Đang đăng nhập với `absa_token` hết hạn; gọi API bảo vệ (vd `GET /api/v1/users`) trả về `401`. | 1. Gửi request tới API bảo vệ có gắn header `Authorization: Bearer <token>`.<br>2. Server trả về `401`.<br>**Mong đợi:** Nếu có `absa_refresh_token` hợp lệ nên thử làm mới token trước; nếu vẫn thất bại thì xóa sạch `localStorage` và đẩy về `/login`. *(Xem lưu ý FE-BUG-03 ở Mục 2)*. |
| **TC-FE-SEC-10** | Kiểm tra phân quyền đường dẫn Quản trị `/users` | Security (Access Control / RBAC) | Specification-Based | Đăng nhập bằng tài khoản quyền `CSKH_STAFF` hoặc `STORE_MANAGER` (không phải `ADMIN`). | 1. Gõ trực tiếp `/users` trên thanh địa chỉ trình duyệt.<br>**Mong đợi:** Giao diện phải chặn truy cập (hiển thị trang 403 Không có quyền hoặc chuyển về `/overview`), không hiển thị màn hình quản trị Admin. *(Xem lưu ý FE-BUG-01 ở Mục 2)*. |

---

### Nhóm 1.4: Quản lý tài khoản Admin & Độ tin cậy / Giao diện (`UsersPage` + `AuthContext`)

| Mã TC | Tên kịch bản | Tiêu chí ISO 25010:2023 | Kỹ thuật ISO 29119-4 | Điều kiện tiên quyết & Đầu vào | Các bước thực hiện & Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FE-SEC-11** | Tạo tài khoản, Lọc tìm kiếm & Khóa/Mở khóa trên `UsersPage` | Functional Suitability · Maintainability | Specification-Based | Đang đăng nhập quyền `ADMIN` tại `/users`. | 1. Lọc danh sách theo từ khóa (`TC-FE-SEC-11A`).<br>2. Bấm **Tạo Tài Khoản Mới**, lưu nhân viên và bấm **Khóa TK** (`TC-FE-SEC-11B`).<br>**Mong đợi:** Gửi `POST /api/v1/users` và `PUT /api/v1/users/{id}` với `{ isActive: false }`; trạng thái đổi từ `Hoạt động` sang `Bị khóa`. |
| **TC-FE-SEC-12** | Chống sập ứng dụng khi dữ liệu phiên trong `localStorage` bị hỏng & Kiểm tra Responsive | Reliability (Fault Tolerance) · Interaction Capability | Error Guessing + UI Layout | Đặt chuỗi JSON lỗi `"absa_user = {broken"` trong `localStorage`; kiểm tra trên khung 1920×1200 và 390×844. | 1. Mở trang web với dữ liệu `localStorage` bị hỏng.<br>2. Kiểm tra trang `/login`, `/register`, `/users` ở độ phân giải Desktop và Mobile.<br>**Mong đợi:** App không bị trắng trang (Crash); trên Mobile bảng `UsersPage` không làm vỡ/tràn trang. *(Xem lưu ý FE-BUG-02 ở Mục 2)*. |

---

## 2. Phát hiện lỗi thực tế từ bước rà soát mã nguồn FE (Static QA Audit)

Khi đối chiếu code Frontend hiện tại với các ca kiểm thử chuẩn ISO ở trên, ghi nhận **5 vấn đề thực tế** cần kiểm chứng/khắc phục:

1. **`FE-BUG-01` (Mức High — Security):** Component `RequireAuth` trong `src/App.jsx` (dòng 26–35) chỉ kiểm tra xem có chuỗi `absa_token` trong `localStorage` hay không, **chưa kiểm tra vai trò (`ADMIN`) khi vào đường dẫn `/users`**, và tin tưởng cả chuỗi token giả nếu người dùng tự gõ vào `localStorage`.
2. **`FE-BUG-02` (Mức High — Reliability):** Trong `src/context/AuthContext.jsx` (dòng 9), lệnh `JSON.parse(saved)` không nằm trong `try/catch`. Nếu giá trị `absa_user` trong `localStorage` bị lỗi định dạng, toàn bộ ứng dụng React sẽ bị sập màn hình trắng ngay lúc khởi động.
3. **`FE-BUG-03` (Mức Medium — Functional/Security):** Trong `src/services/apiClient.js` (dòng 54–60), khi gặp lỗi `401`, Frontend lập tức xóa token và đá về `/login` mà **chưa gọi `/api/v1/auth/refresh-token`** dù `absa_refresh_token` đã được lưu sẵn.
4. **`FE-BUG-04` (Mức Low — Functional):** Trên `src/pages/LoginPage.jsx` (dòng 12, 83–90), ô tích **"Ghi nhớ tôi" (`rememberMe`)** chỉ đổi trạng thái giao diện chứ chưa gắn vào logic lưu phiên (`AuthContext` luôn ghi vào `localStorage`).
5. **`FE-BUG-05` (Mức Low — Interaction Capability):** Trên `src/pages/RegisterPage.jsx` (dòng 106–111), ô nhập mật khẩu chưa có thuộc tính `minLength={6}` (trong khi Backend `RegisterRequest` và modal của `UsersPage` đều yêu cầu tối thiểu 6 ký tự), và nút **"Quên mật khẩu?"** đang dùng hộp thoại `alert()` mặc định của trình duyệt.
