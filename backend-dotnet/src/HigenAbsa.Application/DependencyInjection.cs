using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Application.Services.Auth;
using HigenAbsa.Application.Services.Audit;
using HigenAbsa.Application.Services.Customer;
using HigenAbsa.Application.Services.Dashboard;
using HigenAbsa.Application.Services.Product;
using HigenAbsa.Application.Services.Response;
using HigenAbsa.Application.Services.Review;
using HigenAbsa.Application.Services.Store;
using HigenAbsa.Application.Services.Ticket;

namespace HigenAbsa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IResponseService, ResponseService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IStoreService, StoreService>();
        services.AddScoped<ITicketService, TicketService>();

        return services;
    }
}
