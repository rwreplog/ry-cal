namespace FamilyDashboard.Domain.Entities;

public sealed class Dashboard
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }

    // Free-form string, not an enum: adding a new theme should be a pure frontend
    // change (a CSS token block + one constant entry), never a migration.
    public string Theme { get; set; } = "modern";

    // How the calendar widget lays out its 7 days: "week" (Sunday–Saturday) or
    // "rolling" (today plus the next 6). A string for the same reason as Theme.
    public string CalendarView { get; set; } = "week";

    // Household location for the Weather widget — null until the admin sets it via
    // Display settings. Lives here rather than a new entity because Dashboard is
    // already the single-row-per-family settings blob and SeedData guarantees a row
    // exists; unlike CalendarConnection, "no location yet" isn't a distinct workflow
    // state worth its own entity.
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? LocationLabel { get; set; }

    public DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset UpdatedAtUtc { get; set; }

    public ICollection<DashboardWidget> Widgets { get; init; } = new List<DashboardWidget>();
}
