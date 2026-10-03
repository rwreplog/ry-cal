using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Domain.Entities;
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
            .Where(c => c.FamilyId == familyId && c.Recurrence != RecurrenceType.Weekdays && !c.IsComplete)
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
        // completed it. This generically covers Weekdays completions too (joined
        // purely through ChoreCompletion -> Chore, no recurrence-specific logic).
        var since = timeProvider.GetUtcNow() - CompletedVisibleFor;
        var completedRows = await db.ChoreCompletions
            .Where(cc => cc.CompletedAtUtc >= since)
            .Join(db.Chores.Where(c => c.FamilyId == familyId), cc => cc.ChoreId, c => c.Id, (cc, c) => new { Completion = cc, Chore = c })
            .Join(db.FamilyMembers, x => x.Completion.FamilyMemberId, m => m.Id, (x, m) => new { x.Completion, x.Chore, Member = m })
            .OrderByDescending(x => x.Completion.CompletedAtUtc)
            .Take(DashboardChoreLimit)
            .ToListAsync(cancellationToken);

        var completedOccurrences = completedRows
            .Select(x => (x.Chore.Id, DueAtUtc: x.Completion.DueAtUtc ?? x.Completion.CompletedAtUtc))
            .ToHashSet();

        var completed = completedRows.Select(x => new ChoreSummaryDto(
            x.Completion.Id.ToString(),
            x.Chore.Id,
            x.Chore.Title,
            x.Member.Name,
            x.Member.Id,
            x.Member.Color,
            x.Completion.DueAtUtc ?? x.Completion.CompletedAtUtc,
            true,
            x.Chore.Recurrence));

        var weekdaysOccurrences = await BuildWeekdaysOccurrencesAsync(familyId, completedOccurrences, cancellationToken);

        return rows
            .Select(x => new ChoreSummaryDto(
                x.Chore.Id.ToString(),
                x.Chore.Id,
                x.Chore.Title,
                x.AssignedToName ?? "Unassigned",
                x.Chore.AssignedToFamilyMemberId,
                x.AssignedToColor,
                x.Chore.DueAtUtc,
                x.Chore.IsComplete,
                x.Chore.Recurrence))
            .Concat(weekdaysOccurrences)
            .Concat(completed)
            .ToList();
    }

    // Weekdays chores store no DueAtUtc/IsComplete of their own — each scheduled day
    // is recomputed fresh, every request, against the current week (see
    // ChoreScheduleExpander). Deliberately plain UTC day-of-week arithmetic, not
    // household-timezone-aware — matches ChoreRecurrenceCalculator's existing
    // simplification for Daily/Weekly; real timezone handling is a separate,
    // pre-existing gap this feature isn't taking on.
    private async Task<List<ChoreSummaryDto>> BuildWeekdaysOccurrencesAsync(
        Guid familyId, HashSet<(Guid ChoreId, DateTimeOffset DueAtUtc)> completedOccurrences, CancellationToken cancellationToken)
    {
        var chores = await db.Chores
            .Where(c => c.FamilyId == familyId && c.Recurrence == RecurrenceType.Weekdays)
            .ToListAsync(cancellationToken);

        if (chores.Count == 0)
        {
            return [];
        }

        var choreIds = chores.Select(c => c.Id).ToList();
        var entries = await db.ChoreScheduleEntries
            .Where(e => choreIds.Contains(e.ChoreId))
            .GroupJoin(db.FamilyMembers, e => e.AssignedToFamilyMemberId, m => (Guid?)m.Id, (e, members) => new { Entry = e, Members = members })
            .SelectMany(x => x.Members.DefaultIfEmpty(), (x, m) => new { x.Entry, Name = m != null ? m.Name : null, Color = m != null ? m.Color : null })
            .ToListAsync(cancellationToken);

        var choresById = chores.ToDictionary(c => c.Id);
        var now = timeProvider.GetUtcNow();

        var result = new List<ChoreSummaryDto>();
        foreach (var x in entries)
        {
            var chore = choresById[x.Entry.ChoreId];
            var occurrenceDueAtUtc = ChoreScheduleExpander.ComputeOccurrenceDueAtUtc(x.Entry.DayOfWeek, chore.DueAtUtc, now);
            if (completedOccurrences.Contains((chore.Id, occurrenceDueAtUtc)))
            {
                continue; // already covered by the completedRows query above
            }

            result.Add(new ChoreSummaryDto(
                $"{chore.Id}:{x.Entry.DayOfWeek}",
                chore.Id,
                chore.Title,
                x.Name ?? "Unassigned",
                x.Entry.AssignedToFamilyMemberId,
                x.Color,
                occurrenceDueAtUtc,
                false,
                RecurrenceType.Weekdays));
        }

        return result;
    }
}
