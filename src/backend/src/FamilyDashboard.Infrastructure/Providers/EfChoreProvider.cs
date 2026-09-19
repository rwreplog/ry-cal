using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

// Real chore data for the dashboard widget, replacing DemoChoreProvider now that
// Phase 1 has real Chore persistence. Calendar/Weather/Announcements stay on Demo
// providers (out of scope this phase).
public sealed class EfChoreProvider(AppDbContext db, ICurrentUserService currentUser) : IChoreProvider
{
    private const int DashboardChoreLimit = 8;

    public async Task<IReadOnlyList<ChoreSummaryDto>> GetActiveChoresAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var rows = await db.Chores
            .Where(c => c.FamilyId == familyId && !c.IsComplete)
            .GroupJoin(db.FamilyMembers, c => c.AssignedToFamilyMemberId, m => (Guid?)m.Id, (c, members) => new { Chore = c, Members = members })
            .SelectMany(x => x.Members.DefaultIfEmpty(), (x, m) => new { x.Chore, AssignedToName = m != null ? m.Name : null })
            .OrderBy(x => x.Chore.DueAtUtc)
            .Take(DashboardChoreLimit)
            .ToListAsync(cancellationToken);

        return rows
            .Select(x => new ChoreSummaryDto(
                x.Chore.Id.ToString(),
                x.Chore.Title,
                x.AssignedToName ?? "Unassigned",
                x.Chore.AssignedToFamilyMemberId,
                x.Chore.DueAtUtc,
                x.Chore.IsComplete))
            .ToList();
    }
}
