namespace FamilyDashboard.Domain.Entities;

public sealed class Chore
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public Guid? AssignedToFamilyMemberId { get; set; }
    public RecurrenceType Recurrence { get; set; } = RecurrenceType.None;
    public DateTimeOffset DueAtUtc { get; set; }
    public bool IsComplete { get; set; }
    public DateTimeOffset? LastCompletedAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
