using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Providers;

namespace FamilyDashboard.Tests;

// Chores now come from EfChoreProvider (real Postgres), covered separately by
// ChoresApiTests. This stub keeps DashboardService's composition logic testable
// as a pure unit test, without standing up a DbContext just to exercise composition.
internal sealed class StubChoreProvider : IChoreProvider
{
    public Task<IReadOnlyList<ChoreSummaryDto>> GetActiveChoresAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<ChoreSummaryDto>>(
        [
            new ChoreSummaryDto("chore-1", "Take out the trash", "Sam", null, DateTimeOffset.UtcNow, false),
        ]);
}

// Calendar now comes from GoogleCalendarProvider (real Google API + Postgres connection
// row), covered separately by CalendarApiTests. Same rationale as StubChoreProvider above.
internal sealed class StubCalendarProvider : ICalendarProvider
{
    public Task<IReadOnlyList<CalendarEventDto>> GetUpcomingEventsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<CalendarEventDto>>(
        [
            new CalendarEventDto("evt-1", "Soccer practice", DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1), "Community Field"),
        ]);
}

public class DemoDashboardServiceTests
{
    [Fact]
    public async Task GetDashboardAsync_ComposesDemoProviderOutputIntoDashboardDto()
    {
        var timeProvider = TimeProvider.System;
        var service = new DashboardService(
            new StubCalendarProvider(),
            new StubChoreProvider(),
            new DemoWeatherProvider(),
            new DemoAnnouncementProvider(timeProvider),
            timeProvider);

        var dashboard = await service.GetDashboardAsync(CancellationToken.None);

        Assert.NotEmpty(dashboard.Layout);
        Assert.NotEmpty(dashboard.Calendar.Events);
        Assert.NotEmpty(dashboard.Chores.Items);
        Assert.NotEmpty(dashboard.Announcements.Items);
        Assert.True(dashboard.Weather.Current.TemperatureF is > -100 and < 150);
        Assert.Equal(["clock", "calendar", "chores", "weather", "announcements"], dashboard.Layout.Select(w => w.Type));
    }
}
