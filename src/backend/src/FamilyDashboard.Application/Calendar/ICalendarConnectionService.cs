using FamilyDashboard.Application.Calendar.Dtos;

namespace FamilyDashboard.Application.Calendar;

public interface ICalendarConnectionService
{
    string BuildAuthorizationUrl(string state, string redirectUri);

    Task<bool> CompleteConnectionAsync(string code, string redirectUri, CancellationToken cancellationToken);

    Task<CalendarConnectionDto?> GetConnectionAsync(CancellationToken cancellationToken);

    Task<bool> DisconnectAsync(Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyList<CalendarListItemDto>?> GetAvailableCalendarsAsync(CancellationToken cancellationToken);

    Task<CalendarConnectionDto?> UpdateSelectedCalendarAsync(Guid id, string calendarId, CancellationToken cancellationToken);

    // Connects (or replaces the household's connection with) a public ICS/webcal
    // feed. Validates the URL is reachable and parseable before saving. Returns
    // null if the feed couldn't be loaded.
    Task<CalendarConnectionDto?> ConnectIcsAsync(string icsUrl, CancellationToken cancellationToken);
}
