namespace FamilyDashboard.Domain.Entities;

public sealed class DashboardWidget
{
    public Guid Id { get; init; }
    public required Guid DashboardId { get; set; }

    // Matches a frontend widgetRegistry `type` — free string, not an FK, same
    // treatment as Theme (adding a widget type is a frontend-only concern).
    public required string Type { get; set; }

    public int Order { get; set; }
    public WidgetSize Size { get; set; } = WidgetSize.Md;
    public bool IsVisible { get; set; } = true;
}
