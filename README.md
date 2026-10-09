# HIGEN-ABSA: Hệ Thống Phân Tích Cảm Xúc Phân Cấp & Quản Lý Phản Hồi E-Commerce Bằng AI

![.NET 10](https://img.shields.io/badge/.NET-10.0-purple?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-12.0-blue?style=for-the-badge&logo=csharp)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red?style=for-the-badge&logo=microsoftsqlserver)
![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-1.17-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-cyan?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge&logo=vite)
![JWT Auth](https://img.shields.io/badge/Security-JWT%20%2B%20Refresh%20Token-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 1. GIỚI THIỆU TỔNG QUAN

**HIGEN-ABSA** (**H**ierarchical **I**nsight **G**eneration for **E**-commerce **N**atural Language - **A**spect-**B**ased **S**entiment **A**nalysis) là giải pháp Enterprise AI hỗ trợ quản lý và phân tích phản hồi khách hàng đa sàn Thương mại Điện tử tại Việt Nam (**Shopee**, **Lazada**, **Tiki**, **TikTok Shop**).

### 🎯 Các Tính Năng Nổi Bật:
1. **Suy Luận Siêu Tốc Bằng C# ONNX Runtime**:
   - Tối ưu hóa suy luận mô hình học sâu **ViSoBERT** trên C# .NET 10 thông qua ONNX Runtime Engine & bộ mã hóa **SentencePiece Unigram Custom Tokenizer**, không phụ thuộc vào Python runtime khi vận hành.
2. **Phân Tích Cảm Xúc Phân Cấp (Hierarchical ABSA)**:
   - Phân loại 5 thể loại lớn (**Macro**: `PRODUCT`, `SHIPPING`, `SERVICE`, `PRICE`, `OTHERS`) và 17 khía cạnh chi tiết (**Micro**: `Appearance_Design`, `Delivery_Speed`, `Customer_Support`, v.v.).
3. **Trích Xuất Bằng Chứng & Quy Tắc Ghi Đè (Evidence Spans & Domain Overrides)**:
   - Trích xuất chính xác vị trí ký tự (`evidence_start`, `evidence_end`) của từ ngữ làm căn cứ dự đoán và áp dụng quy tắc ngôn ngữ chuyên biệt cho thị trường E-commerce Việt Nam.
4. **Tự Động Sinh Insight Cho Nhà Bán Hàng (Insight Engine)**:
   - Tự động tổng hợp **Tóm tắt cảm nhận** (*Customer Insight*), **Nguyên nhân cốt lõi** (*Root Cause*), **Khuyến nghị cải thiện** (*Business Recommendation*) và **Câu phản hồi mẫu** (*Suggested Seller Response*).
5. **Hệ Thống Cơ Sở Dữ Liệu SQL Server & Tự Động Mở Ticket Khiếu Nại**:
   - Lưu trữ trên 15 bảng quan hệ SQL Server. Bài đánh giá tiêu cực (`NEG`) có thể tự động khởi tạo **Ticket CSKH**.
6. **Bảo Mật RESTful Enterprise Auth (JWT + Refresh Token Rotation)**:
   - Mã hóa mật khẩu chuẩn **BCrypt**, cơ chế **Access Token (60 phút)** + **Refresh Token Rotation (lưu vết IP/thiết bị)** và phân quyền vai trò (**RBAC**: `ADMIN`, `STORE_MANAGER`, `CSKH_STAFF`).

---

## 2. KIẾN TRÚC HỆ THỐNG

Ứng dụng được thiết kế theo kiến trúc High-Throughput RESTful Service với C# .NET 10 đóng vai trò Core Backend tập trung:

```mermaid
graph TD
    subgraph Client Layer
        FE[Frontend - React 19 / Vite 8 SPA<br/>Port 5173]
    end

    subgraph Core Application Layer (.NET 10)
        API[C# ASP.NET Core Web API<br/>Port 5058]
        Tokenizer[SentencePiece Unigram Tokenizer]
        ONNXEngine[ONNX Runtime Inference Engine]
        EF[Entity Framework Core 10]
        Auth[Enterprise JWT & BCrypt Auth]
    end

    subgraph Storage Layer
        DB[(SQL Server Database<br/>HigenAbsaDb)]
        Models[AI Weights - best_model.onnx<br/>ai-service/models/]
    end

    FE -->|REST API / Bearer JWT| API
    API --> Tokenizer
    Tokenizer --> ONNXEngine
    ONNXEngine -->|Loads Weights| Models
    API --> Auth
    API --> EF
    EF -->|Queries / Auto Persistence| DB
```

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
HIGEN-ABSA-App/
├── backend-dotnet/                       # Core Business & Inference Backend (.NET 10)
│   └── HigenAbsa.Api/
│       ├── Controllers/                  # AuthController, InferenceController
│       ├── Core/                         # TextUtils, Taxonomy, Postprocess, DomainOverrides
│       ├── Data/                         # EF Core AppDbContext & 14 Entity classes
│       │   └── Entities/                 # Core, AI, Response, Security Entities
│       ├── Models/                       # DTOs, AuthDtos, Requests, Options
│       ├── Services/                     # ModelBundle, InferenceService, ViSoBertTokenizer
│       │   └── Auth/                     # JwtTokenService, AuthService
│       ├── Program.cs                    # ASP.NET Core Startup & Swagger Bearer Auth
│       └── appsettings.json              # ConnectionStrings & JWT Config
├── ai-service/                           # Pipeline Lưu trữ & Export Mô hình AI
│   ├── models/visobert_absa_v8/          # ONNX model (best_model.onnx, best_model.onnx.data) & Tokenizer
│   └── export_onnx.py                    # Script export PyTorch sang ONNX format
├── frontend/                             # Giao diện SPA React 19 + Vite 8
│   ├── src/
│   │   ├── api/                          # API Client tự động đính kèm Bearer Token
│   │   ├── components/                   # ReviewInput, AspectTable, InsightCards, AuthModal
│   │   ├── context/                      # AuthContext & AuthProvider
│   │   ├── hooks/                        # Custom Hooks (useAnalyze, useAuth)
│   │   └── pages/                        # Multi-page Views & Overview Dashboard
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 4. BẢNG CƠ SỞ DỮ LIỆU SQL SERVER (DATABASE SCHEMA)

Cơ sở dữ liệu SQL Server (`HigenAbsaDb`) gồm 15 bảng chia thành 5 phân khu nghiệp vụ:

| Phân khu Nghiệp vụ | Danh sách Bảng | Mô tả |
| :--- | :--- | :--- |
| **1. Core & Sync Domain** | `Platforms`, `StoreConnections`, `Products`, `Customers`, `Reviews` | Lưu trữ gian hàng đa sàn, sản phẩm, khách hàng và bài đánh giá thô. |
| **2. AI Processing Domain** | `ReviewAIAnalysis`, `ReviewAspects`, `ReviewKeywords` | Lưu Cảm xúc tổng quan, Insights tự sinh, Bằng chứng (Spans) và Khía cạnh phân cấp. |
| **3. Response Management** | `ResponseTemplates`, `AutomationRules`, `ReviewResponses` | Quản lý mẫu phản hồi, luật trả lời tự động và lịch sử gửi câu trả lời. |
| **4. CSKH Ticketing** | `Tickets` | Tự động mở Ticket khiếu nại cho các đánh giá 1-3 sao hoặc tiêu cực (`NEG`). |
| **5. Security & Audit** | `SystemUsers`, `RefreshTokens`, `AuditLogs` | Quản lý tài khoản, mật khẩu băm BCrypt, JWT Refresh Tokens và nhật ký thao tác. |

---

## 5. HƯỚNG DẪN KHỞI CHẠY (GETTING STARTED)

### Yêu cầu Tiền đề (Prerequisites)
- **.NET SDK**: Version 10.0 trở lên.
- **Node.js**: Version 18.x / 20.x trở lên (`npm` v9+).
- **SQL Server**: SQL Server LocalDB hoặc SQL Server 2019/2022 Express.

---

### Bước 1: Khởi chạy Backend C# (.NET 10 API)

```bash
cd backend-dotnet/HigenAbsa.Api

# Khởi chạy server API (Tự động tạo DB HigenAbsaDb trên SQL Server và nạp ONNX Model)
dotnet run --urls "http://0.0.0.0:5058"
```

- **API Base URL**: `http://localhost:5058`
- **Swagger UI Interactive Docs**: `http://localhost:5058/swagger`

---

### Bước 2: Khởi chạy Frontend React

```bash
cd frontend

# Cài đúng phiên bản thư viện theo package-lock.json
npm ci

# Khởi chạy Vite Dev Server
npm run dev
```

- **Frontend App**: `http://localhost:5173`

---

## 6. HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG

Phần này hướng dẫn các thao tác cơ bản sau khi backend và frontend đã chạy theo mục **Hướng dẫn khởi chạy**.

### 6.1. Đăng nhập hoặc tạo tài khoản

Bỏ qua bước đăng ký/đăng nhập vì hiện tại app tập trung vào demo tính năng chính, khi chạy chương trình sẽ lập tức vào trang **Tổng quan**.

### 6.2. Xem tổng quan và phân tích file đánh giá

1. Mở **Tổng quan** để xem KPI, xu hướng cảm xúc, phân bổ theo sàn và các đánh giá cần chú ý.
2. Chọn **Phân tích File Excel Đánh giá** để tải tệp mẫu hoặc tải lên `.xlsx`, `.xls` hay `.csv`. Tệp mẫu [`test_template.csv`](test_template.csv) có các cột `product_id`, `title`, `content`, `rating`.
3. Chờ ViSoBERT phân tích. Kết quả hiển thị sentiment, khía cạnh được nhận diện và thống kê theo khía cạnh. Luồng tải lên hiện yêu cầu lưu kết quả vào database.

### 6.3. Tra cứu sản phẩm và đánh giá

1. Mở **Sản phẩm** để duyệt gian hàng, danh mục và sản phẩm; chọn sản phẩm để xem chi tiết.
2. Mở **Phản hồi (Feed)**, chọn gian hàng hoặc dùng bộ lọc và tìm kiếm để thu hẹp danh sách.
3. Chọn một đánh giá để xem số sao, nội dung, sentiment tổng thể (`POS`, `NEU`, `NEG`, `MIXED`), khía cạnh macro/micro, evidence và insight AI nếu có.
4. Ở phần phản hồi, xem câu trả lời gợi ý hoặc mẫu, chỉnh sửa nội dung rồi gửi. Nhân viên thực hiện bước gửi thủ công.

### 6.4. Theo dõi khách hàng và xử lý ticket

1. Mở **Khách hàng** để tra cứu hồ sơ và các đánh giá liên quan.
2. Mở **Ticket CSKH** rồi chọn một ticket để xem review gốc và thông tin xử lý.
3. Màn hình có chế độ Kanban/bảng và bộ lọc theo trạng thái. Khi đánh dấu đã giải quyết, nhập ghi chú kết quả.
4. Backend có luồng tạo ticket cho review được phân tích là `NEG`. Nếu API chưa trả ticket, màn hình có thể hiển thị dữ liệu demo. Trong phiên bản hiện tại, thao tác đổi trạng thái từ giao diện chưa được nối đúng với API; không xem thay đổi đó là đã lưu vào database.

### 6.5. Quản lý mẫu phản hồi và quy tắc

1. Mở **Mẫu & Quy tắc** để tạo/chỉnh sửa mẫu và điều kiện theo số sao, sentiment hoặc khía cạnh.
2. Có thể bật/tắt quy tắc và dùng mẫu làm cơ sở soạn câu trả lời.
3. Hiện app lưu và quản lý cấu hình quy tắc; chưa tự chạy quy tắc để gửi phản hồi thay cho nhân viên. Phản hồi trên Feed cần được nhân viên xem lại và gửi.

### 6.6. Kết nối sàn và dữ liệu demo

- Trang **Kết nối sàn** cho phép chọn gian hàng và thao tác đồng bộ trong giao diện. Luồng chọn cửa hàng hiện chủ yếu phục vụ demo; đồng bộ backend cập nhật thời điểm đồng bộ mô phỏng, không tự tải đánh giá thật từ mọi sàn.
- Backend có các endpoint OAuth/API cho Lazada, nhưng cần cấu hình ứng dụng và callback phù hợp trước khi dùng với tài khoản sàn thật. Giao diện hiện tại không có nghĩa cả bốn sàn đã kết nối production.
- Dữ liệu Shopee, Tiki và TikTok Shop trên một số màn hình là dữ liệu mẫu. Hãy nêu rõ dữ liệu demo khi trình bày kết quả.

### 6.7. Quản trị và đăng xuất

Bỏ qua phần quản trị người dùng và phân quyền trong phiên bản demo.

## 7. TÀI LIỆU API ENDPOINTS

### 🔑 Authentication Endpoints (`/api/v1/auth/`)

| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản mới (Mã hóa mật khẩu BCrypt) |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập hệ thống, nhận Access Token (JWT) & Refresh Token |
| `POST` | `/api/v1/auth/refresh-token` | Public | Đổi Access Token mới thông qua Refresh Token Rotation |
| `POST` | `/api/v1/auth/logout` | Public | Thu hồi Refresh Token |
| `GET` | `/api/v1/auth/me` | `[Authorize]` | Lấy thông tin Profile tài khoản đang đăng nhập |

### 🤖 Inference & Insight Endpoints

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái hoạt động của C# Server, ONNX Model và SQL Server DB |
| `GET` | `/labels` | Lấy danh sách nhãn Macro, Micro, Sentiment và cấu hình ngưỡng cắt |
| `POST` | `/predict` | Phân tích 1 bài đánh giá đơn lẻ (Tự động lưu vào SQL Server DB) |
| `POST` | `/predict/batch` | Phân tích hàng loạt danh sách đánh giá cùng lúc |
| `POST` | `/api/infer` | Endpoint hỗ trợ tương thích legacy payload |

---

## 8. GIẤY PHÉP (LICENSE)

Dự án được phát hành theo giấy phép **MIT License**.
