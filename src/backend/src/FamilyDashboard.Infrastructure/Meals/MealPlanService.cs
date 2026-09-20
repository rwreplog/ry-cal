using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Meals;
using FamilyDashboard.Application.Meals.Dtos;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Meals;

public sealed class MealPlanService(AppDbContext db, ICurrentUserService currentUser) : IMealPlanService
{
    public async Task<IReadOnlyList<MealPlanEntryDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.MealPlanEntries
            .Where(m => m.FamilyId == familyId)
            .OrderBy(m => m.Date)
            .Select(m => new MealPlanEntryDto(m.Id, m.Date, m.Name, m.Description))
            .ToListAsync(cancellationToken);
    }

    public async Task<MealPlanEntryDto> CreateAsync(CreateMealPlanEntryRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();

        // The DB unique index (FamilyId, Date) is the real guarantee — this check just
        // turns a collision into a friendly 400 instead of a raw constraint-violation 500.
        var alreadyPlanned = await db.MealPlanEntries.AnyAsync(m => m.FamilyId == familyId && m.Date == request.Date, cancellationToken);
        if (alreadyPlanned)
        {
            throw new ArgumentException($"A meal is already planned for {request.Date:yyyy-MM-dd}. Edit it instead.", nameof(request));
        }

        var entry = new MealPlanEntry
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            Date = request.Date,
            Name = request.Name.Trim(),
            Description = request.Description,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.MealPlanEntries.Add(entry);
        await db.SaveChangesAsync(cancellationToken);

        return new MealPlanEntryDto(entry.Id, entry.Date, entry.Name, entry.Description);
    }

    public async Task<MealPlanEntryDto?> UpdateAsync(Guid id, UpdateMealPlanEntryRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();
        var entry = await db.MealPlanEntries.FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == familyId, cancellationToken);
        if (entry is null)
        {
            return null;
        }

        if (entry.Date != request.Date)
        {
            var alreadyPlanned = await db.MealPlanEntries.AnyAsync(
                m => m.FamilyId == familyId && m.Date == request.Date && m.Id != id, cancellationToken);
            if (alreadyPlanned)
            {
                throw new ArgumentException($"A meal is already planned for {request.Date:yyyy-MM-dd}. Edit it instead.", nameof(request));
            }
        }

        entry.Date = request.Date;
        entry.Name = request.Name.Trim();
        entry.Description = request.Description;
        await db.SaveChangesAsync(cancellationToken);

        return new MealPlanEntryDto(entry.Id, entry.Date, entry.Name, entry.Description);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var entry = await db.MealPlanEntries.FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == familyId, cancellationToken);
        if (entry is null)
        {
            return false;
        }

        db.MealPlanEntries.Remove(entry);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
