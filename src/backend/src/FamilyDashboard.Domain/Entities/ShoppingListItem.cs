namespace FamilyDashboard.Domain.Entities;

public sealed class ShoppingListItem
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public bool IsChecked { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
