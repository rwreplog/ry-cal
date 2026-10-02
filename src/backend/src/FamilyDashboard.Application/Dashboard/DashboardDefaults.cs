using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard;

// The pre-Phase-3 hardcoded layout, kept as the seed default for a new household's
// Dashboard row and as DashboardConfigService's defensive in-memory fallback.
public static class DashboardDefaults
{
    public const string DefaultTheme = "modern";

    public const string DefaultCalendarView = "week";
    public static readonly IReadOnlyList<string> CalendarViews = ["week", "rolling"];

    public const string DefaultDashboardLayout = "stacked";
    public static readonly IReadOnlyList<string> DashboardLayouts = ["stacked", "sidebar"];

    // Clock stayed in the page header (DashboardShell) as an always-visible strip —
    // it's the only one of docs/UI.md's "readable at 10 feet" items that needs to be
    // on screen at all times. Weather lived there too for a while, but has moved
    // back to being an ordinary toggleable/resizable widget (its original
    // docs/PRODUCT.md spot), since nothing requires it to always be visible. Meals
    // and Birthdays moved into the Calendar widget as per-day sections, same as
    // Chores. DashboardConfigService prunes any family's already-saved rows for all
    // retired types against this same list.
    public static readonly IReadOnlyList<(string Type, WidgetSize Size)> Widgets =
    [
        ("calendar", WidgetSize.Md),
        ("weather", WidgetSize.Sm),
        ("chores", WidgetSize.Md),
        ("announcements", WidgetSize.Md),
        ("shopping", WidgetSize.Md),
        ("countdowns", WidgetSize.Md),
    ];
}
