using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

// Real announcement data for the dashboard widget, replacing DemoAnnouncementProvider
// now that Phase 4 has real Announcement persistence.
public sealed class EfAnnouncementProvider(AppDbContext db, ICurrentUserService currentUser) : IAnnouncementProvider
{
    private const int DashboardAnnouncementLimit = 5;

    public async Task<IReadOnlyList<AnnouncementSummaryDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        return await db.Announcements
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.PostedAtUtc)
            .Take(DashboardAnnouncementLimit)
            .Select(a => new AnnouncementSummaryDto(
                a.Id.ToString(),
                a.Message,
                a.PostedAtUtc,
                a.PostedBy ?? "Family"))
            .ToListAsync(cancellationToken);
    }
}
