namespace FamilyDashboard.Domain.Entities;

// Append-only history record: preserve chore ID, family member ID, and completion timestamp.
public sealed class ChoreCompletion
{
    public Guid Id { get; init; }
    public required Guid ChoreId { get; set; }
    public required Guid FamilyMemberId { get; set; }
    public DateTimeOffset CompletedAtUtc { get; init; }
}
