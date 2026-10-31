using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Infrastructure.Events;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IInMemoryEventBus, InMemoryEventBus>();
        return services;
    }
}

