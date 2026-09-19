using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.FamilyMembers;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Auth;
using FamilyDashboard.Infrastructure.Chores;
using FamilyDashboard.Infrastructure.FamilyMembers;
using FamilyDashboard.Infrastructure.Persistence;
using FamilyDashboard.Infrastructure.Providers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FamilyDashboard.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        services.AddScoped<IChoreService, ChoreService>();

        services.AddScoped<ICalendarProvider, DemoCalendarProvider>();
        services.AddScoped<IChoreProvider, EfChoreProvider>();
        services.AddScoped<IWeatherProvider, DemoWeatherProvider>();
        services.AddScoped<IAnnouncementProvider, DemoAnnouncementProvider>();

        return services;
    }
}
