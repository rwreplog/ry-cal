using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface ICalendarProvider
{
    Task<IReadOnlyList<CalendarEventDto>> GetUpcomingEventsAsync(CancellationToken cancellationToken);
}
