using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using HigenAbsa.Infrastructure;
using HigenAbsa.Modules.CoreSync;
using HigenAbsa.Modules.Engagement;
using HigenAbsa.Modules.Inference;
using HigenAbsa.Modules.Reporting;
using HigenAbsa.Modules.Security;
using HigenAbsa.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Keep logging portable
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// 1. Đăng ký Controllers và định dạng JSON snake_case tương thích hoàn toàn với Frontend React
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 2. Đăng ký Hạ tầng dùng chung (In-Memory Event Bus & HttpClient)
builder.Services.AddHttpClient();
builder.Services.AddSharedInfrastructure();

// 3. Đăng ký 5 Module Nghiệp vụ độc lập (Mỗi Module sở hữu DbContext & Schema riêng biệt)
builder.Services
    .AddSecurityModule(builder.Configuration)
    .AddCoreSyncModule(builder.Configuration)
    .AddInferenceModule(builder.Configuration, builder.Environment)
    .AddEngagementModule(builder.Configuration)
    .AddReportingModule(builder.Configuration);

// 4. Cấu hình JWT Bearer Authentication & Authorization
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "HIGEN_ABSA_ENTERPRISE_SECRET_KEY_MUST_BE_AT_LEAST_32_BYTES_LONG_2026";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HigenAbsaApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HigenAbsaApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Cấu hình CORS cho giao diện Web React (hỗ trợ port 3000, 5173 và credentials)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Swagger API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HIGEN-ABSA Enterprise API (Modular Monolith)",
        Version = "v1",
        Description = "Hệ thống phân tích cảm xúc phân cấp e-commerce với kiến trúc Modular Monolith 5 Module độc lập."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer' [space] followed by your valid JWT token.",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer")] = []
    });
});

var app = builder.Build();

// Middleware xử lý ngoại lệ tập trung
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "HIGEN-ABSA Modular Monolith API v1"));
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Endpoint kiểm tra trạng thái kiến trúc Modular Monolith và 5 Schema độc lập
app.MapGet("/api/health", () => Results.Ok(new
{
    system = "HIGEN-ABSA Enterprise Platform (Modular Monolith)",
    status = "Healthy",
    port = 5058,
    modules = new[]
    {
        new { module = "Security",   schema = "security",   dbContext = "SecurityDbContext" },
        new { module = "CoreSync",   schema = "coresync",   dbContext = "CoreSyncDbContext" },
        new { module = "Inference",  schema = "inference",  dbContext = "InferenceDbContext" },
        new { module = "Engagement", schema = "engagement", dbContext = "EngagementDbContext" },
        new { module = "Reporting",  schema = "reporting",  dbContext = "ReportingDbContext" }
    },
    timestamp = DateTimeOffset.UtcNow
}));

app.Run();
