using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;

namespace FamilyDashboard.Application.Dashboard;

public sealed class DashboardService(
    ICalendarProvider calendarProvider,
    IChoreProvider choreProvider,
    IWeatherProvider weatherProvider,
    IAnnouncementProvider announcementProvider,
    TimeProvider timeProvider) : IDashboardService
{
    // Phase 0 has no persisted Dashboard/DashboardWidget configuration (that's Phase 3),
    // so the layout is a fixed default until widget configuration is implemented.
    private static readonly IReadOnlyList<WidgetInstanceDto> DefaultLayout =
    [
        new WidgetInstanceDto("clock", 0, WidgetSize.Sm),
        new WidgetInstanceDto("calendar", 1, WidgetSize.Md),
        new WidgetInstanceDto("chores", 2, WidgetSize.Md),
        new WidgetInstanceDto("weather", 3, WidgetSize.Sm),
        new WidgetInstanceDto("announcements", 4, WidgetSize.Md),
    ];

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
    {
        var eventsTask = calendarProvider.GetUpcomingEventsAsync(cancellationToken);
        var choresTask = choreProvider.GetActiveChoresAsync(cancellationToken);
        var weatherTask = weatherProvider.GetCurrentConditionsAsync(cancellationToken);
        var announcementsTask = announcementProvider.GetActiveAnnouncementsAsync(cancellationToken);

        await Task.WhenAll(eventsTask, choresTask, weatherTask, announcementsTask);

        return new DashboardDto(
            GeneratedAtUtc: timeProvider.GetUtcNow(),
            Layout: DefaultLayout,
            Calendar: new CalendarSectionDto(await eventsTask),
            Chores: new ChoresSectionDto(await choresTask),
            Weather: new WeatherSectionDto(await weatherTask),
            Announcements: new AnnouncementsSectionDto(await announcementsTask));
    }
}
