using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard.Dtos;

public sealed record DashboardDto(
    DateTimeOffset GeneratedAtUtc,
    IReadOnlyList<WidgetInstanceDto> Layout,
    CalendarSectionDto Calendar,
    ChoresSectionDto Chores,
    WeatherSectionDto Weather,
    AnnouncementsSectionDto Announcements,
    MealsSectionDto Meals,
    ShoppingListSectionDto ShoppingList,
    BirthdaysSectionDto Birthdays,
    CountdownsSectionDto Countdowns);

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

// Nullable: no household location has been configured yet is a real, non-error state.
public sealed record WeatherSectionDto(WeatherSnapshotDto? Current);

public sealed record WeatherSnapshotDto(double TemperatureF, string Condition, double HighF, double LowF);

public sealed record AnnouncementsSectionDto(IReadOnlyList<AnnouncementSummaryDto> Items);

public sealed record AnnouncementSummaryDto(string Id, string Message, DateTimeOffset PostedAtUtc, string PostedBy);

public sealed record MealsSectionDto(IReadOnlyList<MealPlanSummaryDto> Items);

public sealed record MealPlanSummaryDto(string Id, DateOnly Date, string Name, string? Description);

public sealed record ShoppingListSectionDto(IReadOnlyList<ShoppingListItemSummaryDto> Items, int TotalUncheckedCount);

public sealed record ShoppingListItemSummaryDto(string Id, string Name);

public sealed record BirthdaysSectionDto(IReadOnlyList<UpcomingBirthdayDto> Items);

public sealed record UpcomingBirthdayDto(string Id, string Name, DateOnly Date, int DaysUntil);

public sealed record CountdownsSectionDto(IReadOnlyList<CountdownSummaryDto> Items);

public sealed record CountdownSummaryDto(string Id, string Label, DateOnly TargetDate, int DaysUntil);
