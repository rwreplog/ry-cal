using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Countdowns;
using FamilyDashboard.Application.Countdowns.Dtos;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Countdowns;

public sealed class CountdownService(AppDbContext db, ICurrentUserService currentUser) : ICountdownService
{
    public async Task<IReadOnlyList<CountdownDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.Countdowns
            .Where(c => c.FamilyId == familyId)
            .OrderBy(c => c.TargetDate)
            .Select(c => new CountdownDto(c.Id, c.Label, c.TargetDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<CountdownDto> CreateAsync(CreateCountdownRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Label))
        {
            throw new ArgumentException("Label is required.", nameof(request));
        }

        var countdown = new Countdown
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Label = request.Label.Trim(),
            TargetDate = request.TargetDate,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.Countdowns.Add(countdown);
        await db.SaveChangesAsync(cancellationToken);

        return new CountdownDto(countdown.Id, countdown.Label, countdown.TargetDate);
    }

    public async Task<CountdownDto?> UpdateAsync(Guid id, UpdateCountdownRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Label))
        {
            throw new ArgumentException("Label is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();
        var countdown = await db.Countdowns.FirstOrDefaultAsync(c => c.Id == id && c.FamilyId == familyId, cancellationToken);
        if (countdown is null)
        {
            return null;
        }

        countdown.Label = request.Label.Trim();
        countdown.TargetDate = request.TargetDate;
        await db.SaveChangesAsync(cancellationToken);

        return new CountdownDto(countdown.Id, countdown.Label, countdown.TargetDate);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var countdown = await db.Countdowns.FirstOrDefaultAsync(c => c.Id == id && c.FamilyId == familyId, cancellationToken);
        if (countdown is null)
        {
            return false;
        }

        db.Countdowns.Remove(countdown);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
