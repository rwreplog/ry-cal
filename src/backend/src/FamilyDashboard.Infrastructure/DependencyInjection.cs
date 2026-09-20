using FamilyDashboard.Application.Announcements;
using FamilyDashboard.Application.Birthdays;
using FamilyDashboard.Application.Calendar;
using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Countdowns;
using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.FamilyMembers;
using FamilyDashboard.Application.Meals;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Application.ShoppingList;
using FamilyDashboard.Infrastructure.Announcements;
using FamilyDashboard.Infrastructure.Auth;
using FamilyDashboard.Infrastructure.Birthdays;
using FamilyDashboard.Infrastructure.Calendar;
using FamilyDashboard.Infrastructure.Chores;
using FamilyDashboard.Infrastructure.Countdowns;
using FamilyDashboard.Infrastructure.Dashboards;
using FamilyDashboard.Infrastructure.FamilyMembers;
using FamilyDashboard.Infrastructure.Meals;
using FamilyDashboard.Infrastructure.Persistence;
using FamilyDashboard.Infrastructure.Providers;
using FamilyDashboard.Infrastructure.Security;
using FamilyDashboard.Infrastructure.ShoppingList;
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
        services.AddScoped<IAnnouncementService, AnnouncementService>();
        services.AddScoped<IMealPlanService, MealPlanService>();
        services.AddScoped<IShoppingListService, ShoppingListService>();
        services.AddScoped<IBirthdayService, BirthdayService>();
        services.AddScoped<ICountdownService, CountdownService>();

        services.AddSingleton<ITokenProtector, CalendarTokenProtector>();
        services.Configure<GoogleOAuthOptions>(configuration.GetSection("Google"));
        services.AddHttpClient("google-oauth");
        services.AddHttpClient("google-calendar");
        services.AddHttpClient("ics-feed");
        services.AddScoped<GoogleTokenService>();
        services.AddScoped<ICalendarConnectionService, CalendarConnectionService>();

        services.AddScoped<IDashboardConfigService, DashboardConfigService>();

        services.AddHttpClient("open-meteo");
        services.AddHttpClient("open-meteo-geocoding");
        services.AddScoped<IGeocodingService, OpenMeteoGeocodingService>();

        services.AddScoped<ICalendarProvider, CalendarProvider>();
        services.AddScoped<IChoreProvider, EfChoreProvider>();
        services.AddScoped<IWeatherProvider, OpenMeteoWeatherProvider>();
        services.AddScoped<IAnnouncementProvider, EfAnnouncementProvider>();
        services.AddScoped<IMealPlanProvider, EfMealPlanProvider>();
        services.AddScoped<IShoppingListProvider, EfShoppingListProvider>();
        services.AddScoped<IBirthdayProvider, EfBirthdayProvider>();
        services.AddScoped<ICountdownProvider, EfCountdownProvider>();

        return services;
    }
}
