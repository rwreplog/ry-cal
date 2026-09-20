namespace FamilyDashboard.Domain.Entities;

public sealed class Dashboard
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }

    // Free-form string, not an enum: adding a new theme should be a pure frontend
    // change (a CSS token block + one constant entry), never a migration.
    public string Theme { get; set; } = "modern";

    public DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset UpdatedAtUtc { get; set; }

    public ICollection<DashboardWidget> Widgets { get; init; } = new List<DashboardWidget>();
}
