# HIGEN-ABSA: Hệ Thống Phân Tích Cảm Xúc Phân Cấp & Quản Lý Phản Hồi E-Commerce Bằng AI

![.NET 10](https://img.shields.io/badge/.NET-10.0-purple?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-12.0-blue?style=for-the-badge&logo=csharp)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red?style=for-the-badge&logo=microsoftsqlserver)
![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-1.17-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-cyan?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)
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
   - Lưu trữ tự động 14 bảng quan hệ trên SQL Server. Bài đánh giá tiêu cực (`NEG`) được tự động khởi tạo **Ticket CSKH** cho nhân viên xử lý.
6. **Bảo Mật RESTful Enterprise Auth (JWT + Refresh Token Rotation)**:
   - Mã hóa mật khẩu chuẩn **BCrypt**, cơ chế **Access Token (60 phút)** + **Refresh Token Rotation (lưu vết IP/thiết bị)** và phân quyền vai trò (**RBAC**: `ADMIN`, `STORE_MANAGER`, `CSKH_STAFF`).

---

## 2. KIẾN TRÚC HỆ THỐNG

Ứng dụng được thiết kế theo kiến trúc High-Throughput RESTful Service với C# .NET 10 đóng vai trò Core Backend tập trung:

```mermaid
graph TD
    subgraph Client Layer
        FE[Frontend - React 19 / Vite 6 SPA<br/>Port 5173]
    end

    subgraph Core Application Layer (.NET 10)
        API[C# ASP.NET Core Web API<br/>Port 8001]
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
├── frontend/                             # Giao diện SPA React 19 + Vite 6
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

Cơ sở dữ liệu SQL Server (`HigenAbsaDb`) gồm 14 bảng chia thành 5 phân khu nghiệp vụ:

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

- **API Base URL (LAN)**: `http://172.20.10.4:5058`
- **Swagger UI Interactive Docs**: `http://172.20.10.4:5058/swagger`

---

### Bước 2: Khởi chạy Frontend React

```bash
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy Vite Dev Server
npm run dev
```

- **Frontend App (LAN)**: `http://172.20.10.4:5173`

---

## 6. TÀI LIỆU API ENDPOINTS

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

## 7. GIẤY PHÉP (LICENSE)

Dự án được phát hành theo giấy phép **MIT License**.
