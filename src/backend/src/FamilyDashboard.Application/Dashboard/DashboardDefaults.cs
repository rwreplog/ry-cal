using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard;

// The pre-Phase-3 hardcoded layout, kept as the seed default for a new household's
// Dashboard row and as DashboardConfigService's defensive in-memory fallback.
public static class DashboardDefaults
{
    public const string DefaultTheme = "modern";

    public static readonly IReadOnlyList<(string Type, WidgetSize Size)> Widgets =
    [
        ("clock", WidgetSize.Sm),
        ("calendar", WidgetSize.Md),
        ("chores", WidgetSize.Md),
        ("weather", WidgetSize.Sm),
        ("announcements", WidgetSize.Md),
        ("meals", WidgetSize.Md),
        ("shopping", WidgetSize.Md),
        ("birthdays", WidgetSize.Md),
        ("countdowns", WidgetSize.Md),
    ];
}
