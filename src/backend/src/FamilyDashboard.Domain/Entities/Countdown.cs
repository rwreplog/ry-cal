namespace FamilyDashboard.Domain.Entities;

public sealed class Countdown
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Label { get; set; }
    public required DateOnly TargetDate { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
