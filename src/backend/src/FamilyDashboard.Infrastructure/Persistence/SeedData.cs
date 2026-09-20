using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Persistence;

// This is an explicitly single-household app (docs/PRODUCT.md), so Phase 1 seeds
// exactly one Family rather than building multi-family onboarding. CurrentUserService
// resolves to this id until Phase 2 replaces it with a real authenticated claim.
public static class SeedData
{
    public static readonly Guid DefaultFamilyId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static async Task EnsureSeededAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        // Family- and Dashboard-seeding each get their own existence check — an
        // existing database (already has a Family from Phase 0/1) must still get a
        // Dashboard row seeded the first time this runs post-Phase-3.
        if (!await db.Families.AnyAsync(cancellationToken))
        {
            db.Families.Add(new Family
            {
                Id = DefaultFamilyId,
                Name = "Replogle Family",
                CreatedAtUtc = DateTimeOffset.UtcNow,
            });

            await db.SaveChangesAsync(cancellationToken);
        }

        if (!await db.Dashboards.AnyAsync(d => d.FamilyId == DefaultFamilyId, cancellationToken))
        {
            var now = DateTimeOffset.UtcNow;
            var dashboard = new Dashboard
            {
                Id = Guid.NewGuid(),
                FamilyId = DefaultFamilyId,
                Theme = DashboardDefaults.DefaultTheme,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            };

            var order = 0;
            foreach (var (type, size) in DashboardDefaults.Widgets)
            {
                dashboard.Widgets.Add(new DashboardWidget
                {
                    Id = Guid.NewGuid(),
                    DashboardId = dashboard.Id,
                    Type = type,
                    Order = order++,
                    Size = size,
                    IsVisible = true,
                });
            }

            db.Dashboards.Add(dashboard);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
