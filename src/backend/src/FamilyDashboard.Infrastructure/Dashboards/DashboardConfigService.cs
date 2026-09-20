using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
// Alias: avoids relying on exact namespace-vs-type shadowing rules for "Dashboard"
// (a nested namespace named Dashboard under Infrastructure would shadow the entity
// class of the same name for every file under FamilyDashboard.Infrastructure).
using DashboardEntity = FamilyDashboard.Domain.Entities.Dashboard;

namespace FamilyDashboard.Infrastructure.Dashboards;

public sealed class DashboardConfigService(
    AppDbContext db,
    ICurrentUserService currentUser,
    TimeProvider timeProvider) : IDashboardConfigService
{
    public async Task<DashboardConfigDto> GetConfigAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return DefaultConfig();
        }

        var dashboard = await db.Dashboards
            .Include(d => d.Widgets)
            .SingleOrDefaultAsync(d => d.FamilyId == familyId, cancellationToken);

        return dashboard is null ? DefaultConfig() : ToDto(dashboard);
    }

    public async Task<DashboardConfigDto> UpdateConfigAsync(UpdateDashboardConfigRequest request, CancellationToken cancellationToken)
    {
        if (request.Widgets.Count == 0)
        {
            throw new ArgumentException("At least one widget is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Theme) || request.Theme.Length > 30)
        {
            throw new ArgumentException("Theme must be between 1 and 30 characters.");
        }

        if (request.Widgets.Any(w => string.IsNullOrWhiteSpace(w.Type) || w.Type.Length > 50))
        {
            throw new ArgumentException("Widget type must be between 1 and 50 characters.");
        }

        if (request.Widgets.Select(w => w.Type).Distinct().Count() != request.Widgets.Count)
        {
            throw new ArgumentException("Widget types must be unique.");
        }

        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            throw new ArgumentException("No current family.");
        }

        var now = timeProvider.GetUtcNow();
        var dashboard = await db.Dashboards
            .Include(d => d.Widgets)
            .SingleOrDefaultAsync(d => d.FamilyId == familyId, cancellationToken);

        if (dashboard is null)
        {
            dashboard = new DashboardEntity
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                CreatedAtUtc = now,
            };
            db.Dashboards.Add(dashboard);
        }

        // Marks the old widgets for deletion (orphaned children of a required
        // relationship). The replacements are added via db.DashboardWidgets, not
        // dashboard.Widgets — adding through the collection navigation instead would
        // have EF infer state by key value (a non-default Guid looks "existing" when
        // discovered via graph fixup rather than DbSet.Add), producing UPDATEs against
        // rows that no longer exist instead of INSERTs.
        dashboard.Widgets.Clear();
        var order = 0;
        var newWidgets = request.Widgets.Select(widget => new DashboardWidget
        {
            Id = Guid.NewGuid(),
            DashboardId = dashboard.Id,
            Type = widget.Type,
            Order = order++,
            Size = widget.Size,
            IsVisible = widget.IsVisible,
        }).ToList();
        db.DashboardWidgets.AddRange(newWidgets);

        dashboard.Theme = request.Theme;
        dashboard.UpdatedAtUtc = now;

        await db.SaveChangesAsync(cancellationToken);
        return ToDto(dashboard);
    }

    private static DashboardConfigDto DefaultConfig() => new(
        DashboardDefaults.Widgets
            .Select(w => new DashboardWidgetConfigDto(w.Type, w.Size, true))
            .ToList(),
        DashboardDefaults.DefaultTheme);

    private static DashboardConfigDto ToDto(DashboardEntity dashboard) => new(
        dashboard.Widgets
            .OrderBy(w => w.Order)
            .Select(w => new DashboardWidgetConfigDto(w.Type, w.Size, w.IsVisible))
            .ToList(),
        dashboard.Theme);
}
