using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Dashboard.Dtos;

public sealed record DashboardConfigDto(IReadOnlyList<DashboardWidgetConfigDto> Widgets, string Theme);

public sealed record DashboardWidgetConfigDto(string Type, WidgetSize Size, bool IsVisible);

// No Order field on the wire: order is array position, both directions. GET returns
// widgets pre-sorted; UpdateConfigAsync recomputes Order from submitted array index.
public sealed record UpdateDashboardConfigRequest(IReadOnlyList<UpdateDashboardWidgetRequest> Widgets, string Theme);

public sealed record UpdateDashboardWidgetRequest(string Type, WidgetSize Size, bool IsVisible);
