using FamilyDashboard.Application.Calendar;
using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.FamilyMembers;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Auth;
using FamilyDashboard.Infrastructure.Calendar;
using FamilyDashboard.Infrastructure.Chores;
using FamilyDashboard.Infrastructure.Dashboards;
using FamilyDashboard.Infrastructure.FamilyMembers;
using FamilyDashboard.Infrastructure.Persistence;
using FamilyDashboard.Infrastructure.Providers;
using FamilyDashboard.Infrastructure.Security;
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

        services.AddMemoryCache();

        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        services.AddScoped<IChoreService, ChoreService>();

        services.AddSingleton<ITokenProtector, CalendarTokenProtector>();
        services.Configure<GoogleOAuthOptions>(configuration.GetSection("Google"));
        services.AddHttpClient("google-oauth");
        services.AddHttpClient("google-calendar");
        services.AddHttpClient("ics-feed");
        services.AddScoped<GoogleTokenService>();
        services.AddScoped<ICalendarConnectionService, CalendarConnectionService>();

        services.AddScoped<IDashboardConfigService, DashboardConfigService>();

        services.AddScoped<ICalendarProvider, CalendarProvider>();
        services.AddScoped<IChoreProvider, EfChoreProvider>();
        services.AddScoped<IWeatherProvider, DemoWeatherProvider>();
        services.AddScoped<IAnnouncementProvider, DemoAnnouncementProvider>();

        return services;
    }
}
