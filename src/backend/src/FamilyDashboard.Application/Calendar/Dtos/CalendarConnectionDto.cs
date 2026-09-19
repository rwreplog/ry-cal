namespace FamilyDashboard.Application.Calendar.Dtos;

public sealed record CalendarConnectionDto(
    Guid Id,
    string Provider,
    string? ConnectedEmail,
    string? CalendarId,
    string? IcsUrl,
    DateTimeOffset ConnectedAtUtc);

public sealed record CalendarListItemDto(string Id, string Summary, bool IsPrimary);

public sealed record UpdateSelectedCalendarRequest(string CalendarId);

public sealed record ConnectIcsRequest(string IcsUrl);
