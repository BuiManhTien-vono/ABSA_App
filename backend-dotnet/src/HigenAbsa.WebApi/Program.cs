using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using HigenAbsa.Application;
using HigenAbsa.Infrastructure;
using HigenAbsa.Infrastructure.Data;
using HigenAbsa.Application.Common;
using HigenAbsa.Application.DTOs.Lazada;
using HigenAbsa.Application.Services.Inference;
using HigenAbsa.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Configuration Options
var absaOptions = builder.Configuration.GetSection(AbsaOptions.SectionName).Get<AbsaOptions>()
    ?? new AbsaOptions();

if (!Path.IsPathRooted(absaOptions.ModelDir))
{
    absaOptions.ModelDir = Path.GetFullPath(
        Path.Combine(builder.Environment.ContentRootPath, absaOptions.ModelDir));
}

var lazadaOptions = builder.Configuration.GetSection(LazadaOptions.SectionName).Get<LazadaOptions>()
    ?? new LazadaOptions();

builder.Services.AddSingleton(absaOptions);
builder.Services.AddSingleton(lazadaOptions);

// Clean Architecture Extension Registrations
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);

// Authentication & JWT
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
builder.Services.AddHttpClient();

// Controllers & JSON Serialization
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
        Title = "HIGEN-ABSA API & E-commerce System (Clean Architecture)",
        Version = "v1",
        Description = "Hierarchical Insight Generation & E-commerce Review Management System (.NET + Clean Architecture + Repository Pattern)",
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
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        logger.LogInformation("Connecting to SQL Server database: {Connection}", connectionString);
        db.Database.EnsureCreated();

        // Seed Admin user
        const string adminEmail = "admin@higen-absa.com";
        const string adminPassword = "Admin@123";

        var admin = db.SystemUsers.SingleOrDefault(user => user.Email == adminEmail);
        if (admin == null)
        {
            db.SystemUsers.Add(new SystemUser
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                FullName = "System Administrator",
                Role = "ADMIN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
            logger.LogInformation("Development administrator account created.");
        }
        else if (!BCrypt.Net.BCrypt.Verify(adminPassword, admin.PasswordHash) || !admin.IsActive)
        {
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            admin.IsActive = true;
            db.SaveChanges();
            logger.LogInformation("Development administrator password hash repaired.");
        }

        logger.LogInformation("SQL Server Database initialized successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Could not initialize SQL Server database automatically.");
    }
}

// Warmup AI model singleton
try
{
    _ = app.Services.GetRequiredService<IInferenceService>();
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "AI Inference Service warmup skipped or failed.");
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
