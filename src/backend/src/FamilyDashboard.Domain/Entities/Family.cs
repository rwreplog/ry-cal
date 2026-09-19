namespace FamilyDashboard.Domain.Entities;

public sealed class Family
{
    public Guid Id { get; init; }
    public required string Name { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
