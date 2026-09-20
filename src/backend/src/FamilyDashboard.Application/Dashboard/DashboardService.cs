using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard;

public sealed class DashboardService(
    ICalendarProvider calendarProvider,
    IChoreProvider choreProvider,
    IWeatherProvider weatherProvider,
    IAnnouncementProvider announcementProvider,
    IMealPlanProvider mealPlanProvider,
    IShoppingListProvider shoppingListProvider,
    IBirthdayProvider birthdayProvider,
    ICountdownProvider countdownProvider,
    IDashboardConfigService dashboardConfigService,
    TimeProvider timeProvider) : IDashboardService
{
    public async Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
    {
        // Awaited sequentially, not via Task.WhenAll: multiple providers/services
        // share the same request-scoped AppDbContext, which isn't safe for
        // concurrent operations from different providers at once.
        var config = await dashboardConfigService.GetConfigAsync(cancellationToken);
        var events = await calendarProvider.GetUpcomingEventsAsync(cancellationToken);
        var chores = await choreProvider.GetActiveChoresAsync(cancellationToken);
        var weather = await weatherProvider.GetCurrentConditionsAsync(cancellationToken);
        var announcements = await announcementProvider.GetActiveAnnouncementsAsync(cancellationToken);
        var meals = await mealPlanProvider.GetUpcomingMealsAsync(cancellationToken);
        var shoppingList = await shoppingListProvider.GetUncheckedItemsAsync(cancellationToken);
        var birthdays = await birthdayProvider.GetUpcomingBirthdaysAsync(cancellationToken);
        var countdowns = await countdownProvider.GetActiveCountdownsAsync(cancellationToken);

        var layout = config.Widgets
            .Where(w => w.IsVisible)
            .Select((w, i) => new WidgetInstanceDto(w.Type, i, w.Size))
            .ToList();

        return new DashboardDto(
            GeneratedAtUtc: timeProvider.GetUtcNow(),
            Layout: layout,
            Calendar: new CalendarSectionDto(events),
            Chores: new ChoresSectionDto(chores),
            Weather: new WeatherSectionDto(weather),
            Announcements: new AnnouncementsSectionDto(announcements),
            Meals: new MealsSectionDto(meals),
            ShoppingList: shoppingList,
            Birthdays: new BirthdaysSectionDto(birthdays),
            Countdowns: new CountdownsSectionDto(countdowns));
    }
}
