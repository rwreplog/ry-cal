using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard.Dtos;

public sealed record DashboardDto(
    DateTimeOffset GeneratedAtUtc,
    IReadOnlyList<WidgetInstanceDto> Layout,
    CalendarSectionDto Calendar,
    ChoresSectionDto Chores,
    WeatherSectionDto Weather,
    AnnouncementsSectionDto Announcements);

public sealed record WidgetInstanceDto(string Type, int Order, WidgetSize Size);

public sealed record CalendarSectionDto(IReadOnlyList<CalendarEventDto> Events);

public sealed record CalendarEventDto(
    string Id,
    string Title,
    DateTimeOffset StartsAtUtc,
    DateTimeOffset EndsAtUtc,
    string? Location);

public sealed record ChoresSectionDto(IReadOnlyList<ChoreSummaryDto> Items);

public sealed record ChoreSummaryDto(
    string Id,
    string Title,
    string AssignedTo,
    Guid? AssignedToFamilyMemberId,
    DateTimeOffset DueAtUtc,
    bool IsComplete);

public sealed record WeatherSectionDto(WeatherSnapshotDto Current);

public sealed record WeatherSnapshotDto(double TemperatureF, string Condition, double HighF, double LowF);

public sealed record AnnouncementsSectionDto(IReadOnlyList<AnnouncementDto> Items);

public sealed record AnnouncementDto(string Id, string Message, DateTimeOffset PostedAtUtc, string PostedBy);
