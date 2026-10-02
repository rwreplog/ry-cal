using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

// Real chore data for the dashboard widget, replacing DemoChoreProvider now that
// Phase 1 has real Chore persistence. Calendar/Weather/Announcements stay on Demo
// providers (out of scope this phase).
public sealed class EfChoreProvider(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : IChoreProvider
{
    // Raised from 8 now that the calendar widget also buckets this same list across
    // a 7-day week (was previously only ever rendered as one flat card).
    private const int DashboardChoreLimit = 30;

    // Completed chores stay on the dashboard this long so the household can see
    // what's been done, matching the calendar's 7-day window.
    private static readonly TimeSpan CompletedVisibleFor = TimeSpan.FromDays(7);

    public async Task<IReadOnlyList<ChoreSummaryDto>> GetActiveChoresAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var rows = await db.Chores
            .Where(c => c.FamilyId == familyId && !c.IsComplete)
            .GroupJoin(db.FamilyMembers, c => c.AssignedToFamilyMemberId, m => (Guid?)m.Id, (c, members) => new { Chore = c, Members = members })
            .SelectMany(x => x.Members.DefaultIfEmpty(), (x, m) => new { x.Chore, AssignedToName = m != null ? m.Name : null, AssignedToColor = m != null ? m.Color : null })
            .OrderBy(x => x.Chore.DueAtUtc)
            .Take(DashboardChoreLimit)
            .ToListAsync(cancellationToken);

        // Built from completion records rather than the chore row itself: a recurring
        // chore flips back to "not complete" with a new due date as soon as it's
        // checked off, so only its completion history remembers it was done. Each
        // entry stays on the day it was due (falling back to the completion time for
        // rows recorded before that was tracked) and is attributed to whoever
        // completed it.
        var since = timeProvider.GetUtcNow() - CompletedVisibleFor;
        var completedRows = await db.ChoreCompletions
            .Where(cc => cc.CompletedAtUtc >= since)
            .Join(db.Chores.Where(c => c.FamilyId == familyId), cc => cc.ChoreId, c => c.Id, (cc, c) => new { Completion = cc, Chore = c })
            .Join(db.FamilyMembers, x => x.Completion.FamilyMemberId, m => m.Id, (x, m) => new { x.Completion, x.Chore, Member = m })
            .OrderByDescending(x => x.Completion.CompletedAtUtc)
            .Take(DashboardChoreLimit)
            .ToListAsync(cancellationToken);

        var completed = completedRows.Select(x => new ChoreSummaryDto(
            x.Completion.Id.ToString(),
            x.Chore.Title,
            x.Member.Name,
            x.Member.Id,
            x.Member.Color,
            x.Completion.DueAtUtc ?? x.Completion.CompletedAtUtc,
            true,
            x.Chore.Recurrence));

        return rows
            .Select(x => new ChoreSummaryDto(
                x.Chore.Id.ToString(),
                x.Chore.Title,
                x.AssignedToName ?? "Unassigned",
                x.Chore.AssignedToFamilyMemberId,
                x.AssignedToColor,
                x.Chore.DueAtUtc,
                x.Chore.IsComplete,
                x.Chore.Recurrence))
            .Concat(completed)
            .ToList();
    }
}
