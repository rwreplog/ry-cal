namespace FamilyDashboard.Domain.Entities;

// Append-only history record: preserve chore ID, family member ID, and completion timestamp.
public sealed class ChoreCompletion
{
    public Guid Id { get; init; }
    public required Guid ChoreId { get; set; }
    public required Guid FamilyMemberId { get; set; }
    public DateTimeOffset CompletedAtUtc { get; init; }

    // The occurrence this completion was for (the chore's due date before a recurring
    // chore rolls forward). Null on rows recorded before this was tracked.
    public DateTimeOffset? DueAtUtc { get; init; }
}
