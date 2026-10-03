using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Chores.Dtos;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Chores;

public sealed class ChoreService(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : IChoreService
{
    public async Task<IReadOnlyList<ChoreDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        var rows = await db.Chores
            .Where(c => c.FamilyId == familyId)
            .GroupJoin(db.FamilyMembers, c => c.AssignedToFamilyMemberId, m => (Guid?)m.Id, (c, members) => new { Chore = c, Members = members })
            .SelectMany(x => x.Members.DefaultIfEmpty(), (x, m) => new { x.Chore, AssignedToName = m != null ? m.Name : null })
            .OrderBy(x => x.Chore.DueAtUtc)
            .ToListAsync(cancellationToken);

        var weekdaysChoreIds = rows.Where(x => x.Chore.Recurrence == RecurrenceType.Weekdays).Select(x => x.Chore.Id).ToList();
        var schedulesByChore = await LoadSchedulesAsync(weekdaysChoreIds, cancellationToken);

        return rows.Select(x => ToDto(x.Chore, x.AssignedToName, schedulesByChore.GetValueOrDefault(x.Chore.Id, []))).ToList();
    }

    public async Task<ChoreDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        return await ToDtoAsync(chore, cancellationToken);
    }

    public async Task<ChoreDto> CreateAsync(CreateChoreRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        var schedule = ValidateSchedule(request.Recurrence, request.Schedule);

        var chore = new Chore
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Title = request.Title.Trim(),
            Description = request.Description,
            // A Weekdays chore's assignment lives entirely in its schedule, not here.
            AssignedToFamilyMemberId = request.Recurrence == RecurrenceType.Weekdays ? null : request.AssignedToFamilyMemberId,
            Recurrence = request.Recurrence,
            DueAtUtc = request.DueAtUtc,
            IsComplete = false,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.Chores.Add(chore);
        if (schedule is not null)
        {
            db.ChoreScheduleEntries.AddRange(schedule.Select(s => new ChoreScheduleEntry
            {
                Id = Guid.NewGuid(),
                ChoreId = chore.Id,
                DayOfWeek = s.DayOfWeek,
                AssignedToFamilyMemberId = s.FamilyMemberId,
            }));
        }
        await db.SaveChangesAsync(cancellationToken);

        return await ToDtoAsync(chore, cancellationToken);
    }

    public async Task<ChoreDto?> UpdateAsync(Guid id, UpdateChoreRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        var schedule = ValidateSchedule(request.Recurrence, request.Schedule);

        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        chore.Title = request.Title.Trim();
        chore.Description = request.Description;
        chore.Recurrence = request.Recurrence;
        chore.DueAtUtc = request.DueAtUtc;
        if (request.Recurrence == RecurrenceType.Weekdays)
        {
            chore.AssignedToFamilyMemberId = null;
        }

        // Clear-and-recreate, matching DashboardConfigService's handling of
        // DashboardWidget rows — this codebase has no tracked navigation
        // collections, so a bulk replace via the DbSet is the simplest correct way
        // to reconcile the schedule, including clearing it out entirely when a
        // chore is switched away from Weekdays to another recurrence.
        var existingEntries = await db.ChoreScheduleEntries.Where(e => e.ChoreId == chore.Id).ToListAsync(cancellationToken);
        db.ChoreScheduleEntries.RemoveRange(existingEntries);
        if (schedule is not null)
        {
            db.ChoreScheduleEntries.AddRange(schedule.Select(s => new ChoreScheduleEntry
            {
                Id = Guid.NewGuid(),
                ChoreId = chore.Id,
                DayOfWeek = s.DayOfWeek,
                AssignedToFamilyMemberId = s.FamilyMemberId,
            }));
        }

        await db.SaveChangesAsync(cancellationToken);

        return await ToDtoAsync(chore, cancellationToken);
    }

    // Returns the validated schedule for a Weekdays chore (always non-null, 1-7
    // entries, no duplicate days), or null when Recurrence isn't Weekdays (any
    // submitted schedule is ignored in that case).
    private static IReadOnlyList<ChoreScheduleEntryRequest>? ValidateSchedule(
        RecurrenceType recurrence, IReadOnlyList<ChoreScheduleEntryRequest>? schedule)
    {
        if (recurrence != RecurrenceType.Weekdays)
        {
            return null;
        }

        if (schedule is null || schedule.Count == 0)
        {
            throw new ArgumentException("At least one day is required for a Weekdays chore.", nameof(schedule));
        }

        if (schedule.Select(s => s.DayOfWeek).Distinct().Count() != schedule.Count)
        {
            throw new ArgumentException("Each day can only appear once in the schedule.", nameof(schedule));
        }

        return schedule;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return false;
        }

        db.Chores.Remove(chore);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ChoreDto?> AssignAsync(Guid id, AssignChoreRequest request, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        chore.AssignedToFamilyMemberId = request.FamilyMemberId;
        await db.SaveChangesAsync(cancellationToken);

        return await ToDtoAsync(chore, cancellationToken);
    }

    public async Task<ChoreDto?> CompleteAsync(Guid id, CompleteChoreRequest request, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        var now = timeProvider.GetUtcNow();

        if (chore.Recurrence == RecurrenceType.Weekdays)
        {
            // Weekdays chores keep no DueAtUtc/IsComplete state of their own — each
            // scheduled day is recomputed fresh from ChoreScheduleEntry every
            // request (ChoreScheduleExpander), so completing one occurrence is
            // purely "record that it happened"; nothing on the Chore row changes.
            if (request.OccurrenceDueAtUtc is not { } occurrenceDueAtUtc)
            {
                throw new ArgumentException("occurrenceDueAtUtc is required to complete a Weekdays chore.", nameof(request));
            }

            db.ChoreCompletions.Add(new ChoreCompletion
            {
                Id = Guid.NewGuid(),
                ChoreId = chore.Id,
                FamilyMemberId = request.FamilyMemberId,
                CompletedAtUtc = now,
                DueAtUtc = occurrenceDueAtUtc,
            });

            await db.SaveChangesAsync(cancellationToken);
            return await ToDtoAsync(chore, cancellationToken);
        }

        db.ChoreCompletions.Add(new ChoreCompletion
        {
            Id = Guid.NewGuid(),
            ChoreId = chore.Id,
            FamilyMemberId = request.FamilyMemberId,
            CompletedAtUtc = now,
            DueAtUtc = chore.DueAtUtc,
        });

        chore.LastCompletedAtUtc = now;

        if (chore.Recurrence == RecurrenceType.None)
        {
            chore.IsComplete = true;
        }
        else
        {
            chore.DueAtUtc = ChoreRecurrenceCalculator.ComputeNextDueAtUtc(chore.Recurrence, chore.DueAtUtc, now);
            chore.IsComplete = false;
        }

        await db.SaveChangesAsync(cancellationToken);

        return await ToDtoAsync(chore, cancellationToken);
    }

    public async Task<IReadOnlyList<ChoreCompletionDto>> GetCompletionHistoryAsync(
        Guid? choreId, Guid? familyMemberId, int take, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        var query = db.ChoreCompletions
            .Join(db.Chores, cc => cc.ChoreId, c => c.Id, (cc, c) => new { Completion = cc, Chore = c })
            .Where(x => x.Chore.FamilyId == familyId);

        if (choreId is { } cid)
        {
            query = query.Where(x => x.Completion.ChoreId == cid);
        }

        if (familyMemberId is { } mid)
        {
            query = query.Where(x => x.Completion.FamilyMemberId == mid);
        }

        return await query
            .OrderByDescending(x => x.Completion.CompletedAtUtc)
            .Take(take)
            .Join(db.FamilyMembers, x => x.Completion.FamilyMemberId, m => m.Id, (x, m) => new ChoreCompletionDto(
                x.Completion.Id, x.Completion.ChoreId, x.Chore.Title, x.Completion.FamilyMemberId, m.Name, x.Completion.CompletedAtUtc))
            .ToListAsync(cancellationToken);
    }

    private Task<Chore?> FindChoreAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        return db.Chores.FirstOrDefaultAsync(c => c.Id == id && c.FamilyId == familyId, cancellationToken);
    }

    private Task<string?> AssignedToNameAsync(Guid? familyMemberId, CancellationToken cancellationToken) =>
        familyMemberId is { } id
            ? db.FamilyMembers.Where(m => m.Id == id).Select(m => (string?)m.Name).FirstOrDefaultAsync(cancellationToken)
            : Task.FromResult<string?>(null);

    private async Task<ChoreDto> ToDtoAsync(Chore chore, CancellationToken cancellationToken)
    {
        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        var schedule = chore.Recurrence == RecurrenceType.Weekdays
            ? (await LoadSchedulesAsync([chore.Id], cancellationToken)).GetValueOrDefault(chore.Id, [])
            : [];
        return ToDto(chore, assignedToName, schedule);
    }

    private async Task<Dictionary<Guid, List<ChoreScheduleEntryDto>>> LoadSchedulesAsync(
        IReadOnlyList<Guid> choreIds, CancellationToken cancellationToken)
    {
        if (choreIds.Count == 0)
        {
            return [];
        }

        var entries = await db.ChoreScheduleEntries
            .Where(e => choreIds.Contains(e.ChoreId))
            .GroupJoin(db.FamilyMembers, e => e.AssignedToFamilyMemberId, m => (Guid?)m.Id, (e, members) => new { Entry = e, Members = members })
            .SelectMany(x => x.Members.DefaultIfEmpty(), (x, m) => new { x.Entry, Name = m != null ? m.Name : null, Color = m != null ? m.Color : null })
            .ToListAsync(cancellationToken);

        return entries
            .GroupBy(x => x.Entry.ChoreId)
            .ToDictionary(
                g => g.Key,
                g => g.OrderBy(x => x.Entry.DayOfWeek)
                    .Select(x => new ChoreScheduleEntryDto(x.Entry.DayOfWeek, x.Entry.AssignedToFamilyMemberId, x.Name, x.Color))
                    .ToList());
    }

    private static ChoreDto ToDto(Chore chore, string? assignedToName, IReadOnlyList<ChoreScheduleEntryDto> schedule) => new(
        chore.Id, chore.Title, chore.Description, chore.AssignedToFamilyMemberId, assignedToName,
        chore.Recurrence, chore.DueAtUtc, chore.IsComplete, chore.LastCompletedAtUtc, schedule);

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
