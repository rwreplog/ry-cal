namespace FamilyDashboard.Domain.Entities;

public sealed class MealPlanEntry
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required DateOnly Date { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
