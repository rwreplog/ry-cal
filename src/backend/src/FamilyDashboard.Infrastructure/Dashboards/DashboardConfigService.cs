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

        return dashboard is null ? DefaultConfig() : MergeWithDefaults(ToDto(dashboard));
    }

    // Read-time reconciliation, deliberately not persisted here: a family's saved
    // config only has the widget types that existed when they last saved. Widget
    // types added in a later release (e.g. Phase 4's meals/shopping/birthdays/
    // countdowns) would otherwise never appear for an existing household — there's
    // no "add a widget" UI, only reorder/resize/show-hide for types already present.
    // Conversely, types retired in a later release (clock/weather → the page header;
    // meals/birthdays → per-day sections in the Calendar widget) would otherwise
    // linger forever in an existing household's saved rows. Doing both against the
    // same DashboardDefaults.Widgets list on every read
    // is cheap (two HashSet diffs) and self-healing for every family, current and
    // future, with no backfill/migration step. The next real "Save changes" persists
    // the reconciled set, making this a one-time no-op after that.
    private static DashboardConfigDto MergeWithDefaults(DashboardConfigDto config)
    {
        var knownTypes = DashboardDefaults.Widgets.Select(w => w.Type).ToHashSet();
        var kept = config.Widgets.Where(w => knownTypes.Contains(w.Type)).ToList();

        var existingTypes = kept.Select(w => w.Type).ToHashSet();
        var missing = DashboardDefaults.Widgets
            .Where(w => !existingTypes.Contains(w.Type))
            .Select(w => new DashboardWidgetConfigDto(w.Type, w.Size, IsVisible: true))
            .ToList();

        return kept.Count == config.Widgets.Count && missing.Count == 0 ? config : config with { Widgets = [.. kept, .. missing] };
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

    public async Task<HouseholdLocationDto> GetLocationAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return new HouseholdLocationDto(null, null, null);
        }

        var dashboard = await db.Dashboards.SingleOrDefaultAsync(d => d.FamilyId == familyId, cancellationToken);
        return dashboard is null
            ? new HouseholdLocationDto(null, null, null)
            : new HouseholdLocationDto(dashboard.Latitude, dashboard.Longitude, dashboard.LocationLabel);
    }

    public async Task<HouseholdLocationDto> UpdateLocationAsync(UpdateHouseholdLocationRequest request, CancellationToken cancellationToken)
    {
        if (request.Latitude is < -90 or > 90)
        {
            throw new ArgumentException("Latitude must be between -90 and 90.");
        }

        if (request.Longitude is < -180 or > 180)
        {
            throw new ArgumentException("Longitude must be between -180 and 180.");
        }

        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            throw new ArgumentException("No current family.");
        }

        var now = timeProvider.GetUtcNow();
        var dashboard = await db.Dashboards.SingleOrDefaultAsync(d => d.FamilyId == familyId, cancellationToken);
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

        dashboard.Latitude = request.Latitude;
        dashboard.Longitude = request.Longitude;
        dashboard.LocationLabel = request.LocationLabel;
        dashboard.UpdatedAtUtc = now;

        await db.SaveChangesAsync(cancellationToken);
        return new HouseholdLocationDto(dashboard.Latitude, dashboard.Longitude, dashboard.LocationLabel);
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
