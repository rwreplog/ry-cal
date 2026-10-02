using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard;

// The pre-Phase-3 hardcoded layout, kept as the seed default for a new household's
// Dashboard row and as DashboardConfigService's defensive in-memory fallback.
public static class DashboardDefaults
{
    public const string DefaultTheme = "modern";

    public const string DefaultCalendarView = "week";
    public static readonly IReadOnlyList<string> CalendarViews = ["week", "rolling"];

    // Clock and Weather moved into the page header (DashboardShell) as an
    // always-visible strip; Meals and Birthdays moved into the Calendar widget as
    // per-day sections, same as Chores. DashboardConfigService prunes any family's
    // already-saved rows for all four retired types against this same list.
    public static readonly IReadOnlyList<(string Type, WidgetSize Size)> Widgets =
    [
        ("calendar", WidgetSize.Md),
        ("chores", WidgetSize.Md),
        ("announcements", WidgetSize.Md),
        ("shopping", WidgetSize.Md),
        ("countdowns", WidgetSize.Md),
    ];
}
