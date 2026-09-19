using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Chores.Dtos;

public sealed record ChoreDto(
    Guid Id,
    string Title,
    string? Description,
    Guid? AssignedToFamilyMemberId,
    string? AssignedToName,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc,
    bool IsComplete,
    DateTimeOffset? LastCompletedAtUtc);

public sealed record CreateChoreRequest(
    string Title,
    string? Description,
    Guid? AssignedToFamilyMemberId,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc);

public sealed record UpdateChoreRequest(
    string Title,
    string? Description,
    RecurrenceType Recurrence,
    DateTimeOffset DueAtUtc);

public sealed record AssignChoreRequest(Guid? FamilyMemberId);

public sealed record CompleteChoreRequest(Guid FamilyMemberId);

public sealed record ChoreCompletionDto(
    Guid Id,
    Guid ChoreId,
    string ChoreTitle,
    Guid FamilyMemberId,
    string FamilyMemberName,
    DateTimeOffset CompletedAtUtc);
