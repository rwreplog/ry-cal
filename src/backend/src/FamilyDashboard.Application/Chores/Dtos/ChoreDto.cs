using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Chores.Dtos;

public sealed record ChoreScheduleEntryDto(
    DayOfWeek DayOfWeek,
    Guid? FamilyMemberId,
    string? FamilyMemberName,
    string? FamilyMemberColor);

public sealed record ChoreScheduleEntryRequest(DayOfWeek DayOfWeek, Guid? FamilyMemberId);

public sealed record ChoreDto(
    Guid Id,
    string Title,
    string? Description,
    Guid? AssignedToFamilyMemberId,
    string? AssignedToName,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc,
    bool IsComplete,
    DateTimeOffset? LastCompletedAtUtc,
    // Only populated when Recurrence == Weekdays; empty otherwise.
    IReadOnlyList<ChoreScheduleEntryDto> Schedule);

public sealed record CreateChoreRequest(
    string Title,
    string? Description,
    Guid? AssignedToFamilyMemberId,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc,
    // Required (1-7 entries, no duplicate days) when Recurrence == Weekdays;
    // ignored otherwise.
    IReadOnlyList<ChoreScheduleEntryRequest>? Schedule = null);

public sealed record UpdateChoreRequest(
    string Title,
    string? Description,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc,
    IReadOnlyList<ChoreScheduleEntryRequest>? Schedule = null);

public sealed record AssignChoreRequest(Guid? FamilyMemberId);

public sealed record CompleteChoreRequest(Guid FamilyMemberId, DateTimeOffset? OccurrenceDueAtUtc = null);

public sealed record ChoreCompletionDto(
    Guid Id,
    Guid ChoreId,
    string ChoreTitle,
    Guid FamilyMemberId,
    string FamilyMemberName,
    DateTimeOffset CompletedAtUtc);
