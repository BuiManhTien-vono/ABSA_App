// Program.cs - ASP.NET Core application entry point
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using HigenAbsa.Api;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Services;
using HigenAbsa.Api.Services.Auth;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------
var absaOptions = builder.Configuration.GetSection(AbsaOptions.SectionName).Get<AbsaOptions>()
    ?? new AbsaOptions();

if (!Path.IsPathRooted(absaOptions.ModelDir))
{
    absaOptions.ModelDir = Path.GetFullPath(
        Path.Combine(builder.Environment.ContentRootPath, absaOptions.ModelDir));
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=HigenAbsaDb;Trusted_Connection=True;TrustServerCertificate=True;";

// -----------------------------------------------------------------------
// Database & Authentication Services
// -----------------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sqlServerOptions =>
        sqlServerOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null)));

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "HIGEN_ABSA_ENTERPRISE_SECRET_KEY_MUST_BE_AT_LEAST_32_BYTES_LONG_2026";
var jwtIssuer    = builder.Configuration["Jwt:Issuer"] ?? "HigenAbsaApi";
var jwtAudience  = builder.Configuration["Jwt:Audience"] ?? "HigenAbsaApp";

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

builder.Services.AddSingleton(absaOptions);
builder.Services.AddSingleton<ModelBundle>();
builder.Services.AddSingleton<IInferenceService, InferenceService>();

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
        opts.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HIGEN-ABSA API & E-commerce System",
        Version = "v1",
        Description = "Hierarchical Insight Generation & E-commerce Review Management System (.NET + Enterprise JWT Auth)",
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

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// -----------------------------------------------------------------------
// Build & Database Initialization
// -----------------------------------------------------------------------
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        logger.LogInformation("Connecting to SQL Server database: {Connection}", connectionString);
        db.Database.EnsureCreated();
        logger.LogInformation("SQL Server Database initialized successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Could not initialize SQL Server database automatically.");
    }
}

// Warmup: force singleton instantiation (loads ONNX model at startup)
_ = app.Services.GetRequiredService<IInferenceService>();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
