using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class DemoCalendarProvider(TimeProvider timeProvider) : ICalendarProvider
{
    public Task<IReadOnlyList<CalendarEventDto>> GetUpcomingEventsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(DemoData.BuildUpcomingEvents(timeProvider.GetUtcNow()));
}
