namespace FamilyDashboard.Domain.Entities;

public sealed class FamilyMember
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public string? Color { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
