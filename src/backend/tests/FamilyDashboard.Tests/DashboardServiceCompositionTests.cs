using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Tests;

// Chores now come from EfChoreProvider (real Postgres), covered separately by
// ChoresApiTests. This stub keeps DashboardService's composition logic testable
// as a pure unit test, without standing up a DbContext just to exercise composition.
internal sealed class StubChoreProvider : IChoreProvider
{
    public Task<IReadOnlyList<ChoreSummaryDto>> GetActiveChoresAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<ChoreSummaryDto>>(
        [
            new ChoreSummaryDto("chore-1", "Take out the trash", "Sam", null, "#0ea5e9", DateTimeOffset.UtcNow, false),
        ]);
}

// Calendar now comes from CalendarProvider (real Google/ICS + Postgres connection
// row), covered separately by CalendarApiTests. Same rationale as StubChoreProvider above.
internal sealed class StubCalendarProvider : ICalendarProvider
{
    public Task<IReadOnlyList<CalendarEventDto>> GetUpcomingEventsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<CalendarEventDto>>(
        [
            new CalendarEventDto("evt-1", "Soccer practice", DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1), "Community Field"),
        ]);
}

// Weather now comes from OpenMeteoWeatherProvider (real HTTP + Postgres location),
// covered separately (no HTTP-mocked integration test — see plan notes; matches
// CalendarApiTests not exercising Google's real fetch path either).
internal sealed class StubWeatherProvider : IWeatherProvider
{
    public Task<WeatherSnapshotDto?> GetCurrentConditionsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<WeatherSnapshotDto?>(new WeatherSnapshotDto(68, "Partly cloudy", 74, 58, false, "Partly cloudy"));
}

// Announcements now come from EfAnnouncementProvider (real Postgres), covered
// separately by AnnouncementsApiTests. Same rationale as StubChoreProvider above.
internal sealed class StubAnnouncementProvider : IAnnouncementProvider
{
    public Task<IReadOnlyList<AnnouncementSummaryDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<AnnouncementSummaryDto>>(
        [
            new AnnouncementSummaryDto("ann-1", "Grandma's visiting this weekend!", DateTimeOffset.UtcNow, "Mom"),
        ]);
}

internal sealed class StubMealPlanProvider : IMealPlanProvider
{
    public Task<IReadOnlyList<MealPlanSummaryDto>> GetUpcomingMealsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<MealPlanSummaryDto>>(
        [
            new MealPlanSummaryDto("meal-1", DateOnly.FromDateTime(DateTime.UtcNow), "Tacos", null),
        ]);
}

internal sealed class StubShoppingListProvider : IShoppingListProvider
{
    public Task<ShoppingListSectionDto> GetUncheckedItemsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(new ShoppingListSectionDto([new ShoppingListItemSummaryDto("item-1", "Milk")], 1));
}

internal sealed class StubBirthdayProvider : IBirthdayProvider
{
    public Task<IReadOnlyList<UpcomingBirthdayDto>> GetUpcomingBirthdaysAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<UpcomingBirthdayDto>>(
        [
            new UpcomingBirthdayDto("bday-1", "Grandma", new DateOnly(1950, 1, 1), 5),
        ]);
}

internal sealed class StubCountdownProvider : ICountdownProvider
{
    public Task<IReadOnlyList<CountdownSummaryDto>> GetActiveCountdownsAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<CountdownSummaryDto>>(
        [
            new CountdownSummaryDto("cd-1", "Disney trip", DateOnly.FromDateTime(DateTime.UtcNow.AddDays(12)), 12),
        ]);
}

// Dashboard config now comes from DashboardConfigService (real Postgres), covered
// separately by DashboardConfigApiTests. Same rationale as StubChoreProvider above.
internal sealed class StubDashboardConfigService : IDashboardConfigService
{
    private static readonly DashboardConfigDto Config = new(
        [
            new DashboardWidgetConfigDto("calendar", WidgetSize.Md, true),
            new DashboardWidgetConfigDto("chores", WidgetSize.Md, true),
            new DashboardWidgetConfigDto("announcements", WidgetSize.Md, true),
            new DashboardWidgetConfigDto("shopping", WidgetSize.Md, true),
            new DashboardWidgetConfigDto("countdowns", WidgetSize.Md, true),
        ],
        "modern");

    public Task<DashboardConfigDto> GetConfigAsync(CancellationToken cancellationToken) => Task.FromResult(Config);

    public Task<DashboardConfigDto> UpdateConfigAsync(UpdateDashboardConfigRequest request, CancellationToken cancellationToken) =>
        throw new NotSupportedException();

    public Task<HouseholdLocationDto> GetLocationAsync(CancellationToken cancellationToken) =>
        throw new NotSupportedException();

    public Task<HouseholdLocationDto> UpdateLocationAsync(UpdateHouseholdLocationRequest request, CancellationToken cancellationToken) =>
        throw new NotSupportedException();
}

public class DashboardServiceCompositionTests
{
    [Fact]
    public async Task GetDashboardAsync_ComposesAllProviderOutputIntoDashboardDto()
    {
        var timeProvider = TimeProvider.System;
        var service = new DashboardService(
            new StubCalendarProvider(),
            new StubChoreProvider(),
            new StubWeatherProvider(),
            new StubAnnouncementProvider(),
            new StubMealPlanProvider(),
            new StubShoppingListProvider(),
            new StubBirthdayProvider(),
            new StubCountdownProvider(),
            new StubDashboardConfigService(),
            timeProvider);

        var dashboard = await service.GetDashboardAsync(CancellationToken.None);

        Assert.NotEmpty(dashboard.Layout);
        Assert.NotEmpty(dashboard.Calendar.Events);
        Assert.NotEmpty(dashboard.Chores.Items);
        Assert.NotEmpty(dashboard.Announcements.Items);
        Assert.NotEmpty(dashboard.Meals.Items);
        Assert.NotEmpty(dashboard.ShoppingList.Items);
        Assert.NotEmpty(dashboard.Birthdays.Items);
        Assert.NotEmpty(dashboard.Countdowns.Items);
        Assert.NotNull(dashboard.Weather.Current);
        Assert.True(dashboard.Weather.Current!.TemperatureF is > -100 and < 150);
        Assert.Equal(
            ["calendar", "chores", "announcements", "shopping", "countdowns"],
            dashboard.Layout.Select(w => w.Type));
    }
}
