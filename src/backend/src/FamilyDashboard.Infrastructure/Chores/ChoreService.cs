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

        return rows.Select(x => ToDto(x.Chore, x.AssignedToName)).ToList();
    }

    public async Task<ChoreDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        return ToDto(chore, assignedToName);
    }

    public async Task<ChoreDto> CreateAsync(CreateChoreRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        var chore = new Chore
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Title = request.Title.Trim(),
            Description = request.Description,
            AssignedToFamilyMemberId = request.AssignedToFamilyMemberId,
            Recurrence = request.Recurrence,
            DueAtUtc = request.DueAtUtc,
            IsComplete = false,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.Chores.Add(chore);
        await db.SaveChangesAsync(cancellationToken);

        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        return ToDto(chore, assignedToName);
    }

    public async Task<ChoreDto?> UpdateAsync(Guid id, UpdateChoreRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        chore.Title = request.Title.Trim();
        chore.Description = request.Description;
        chore.Recurrence = request.Recurrence;
        chore.DueAtUtc = request.DueAtUtc;
        await db.SaveChangesAsync(cancellationToken);

        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        return ToDto(chore, assignedToName);
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

        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        return ToDto(chore, assignedToName);
    }

    public async Task<ChoreDto?> CompleteAsync(Guid id, CompleteChoreRequest request, CancellationToken cancellationToken)
    {
        var chore = await FindChoreAsync(id, cancellationToken);
        if (chore is null)
        {
            return null;
        }

        var now = timeProvider.GetUtcNow();

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

        var assignedToName = await AssignedToNameAsync(chore.AssignedToFamilyMemberId, cancellationToken);
        return ToDto(chore, assignedToName);
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

    private static ChoreDto ToDto(Chore chore, string? assignedToName) => new(
        chore.Id, chore.Title, chore.Description, chore.AssignedToFamilyMemberId, assignedToName,
        chore.Recurrence, chore.DueAtUtc, chore.IsComplete, chore.LastCompletedAtUtc);

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
