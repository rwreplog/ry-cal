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
        // Awaited sequentially, not via Task.WhenAll: multiple providers (calendar,
        // chores) share the same request-scoped AppDbContext, which isn't safe for
        // concurrent operations from different providers at once.
        var events = await calendarProvider.GetUpcomingEventsAsync(cancellationToken);
        var chores = await choreProvider.GetActiveChoresAsync(cancellationToken);
        var weather = await weatherProvider.GetCurrentConditionsAsync(cancellationToken);
        var announcements = await announcementProvider.GetActiveAnnouncementsAsync(cancellationToken);

        return new DashboardDto(
            GeneratedAtUtc: timeProvider.GetUtcNow(),
            Layout: DefaultLayout,
            Calendar: new CalendarSectionDto(events),
            Chores: new ChoresSectionDto(chores),
            Weather: new WeatherSectionDto(weather),
            Announcements: new AnnouncementsSectionDto(announcements));
    }
}
