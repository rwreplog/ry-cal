namespace FamilyDashboard.Domain.Entities;

// Standalone list, deliberately not tied to FamilyMember — covers grandparents,
// friends, anyone the household wants a birthday reminder for. The year is stored
// (DateOnly has no partial-date variant) but ignored by the "days until" calculation.
public sealed class Birthday
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public required DateOnly Date { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
