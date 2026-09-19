using FamilyDashboard.Application.Dashboard;
using Microsoft.Extensions.DependencyInjection;

namespace FamilyDashboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
