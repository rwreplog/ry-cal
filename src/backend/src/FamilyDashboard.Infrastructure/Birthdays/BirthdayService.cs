using FamilyDashboard.Application.Birthdays;
using FamilyDashboard.Application.Birthdays.Dtos;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Birthdays;

public sealed class BirthdayService(AppDbContext db, ICurrentUserService currentUser) : IBirthdayService
{
    public async Task<IReadOnlyList<BirthdayDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.Birthdays
            .Where(b => b.FamilyId == familyId)
            .OrderBy(b => b.Name)
            .Select(b => new BirthdayDto(b.Id, b.Name, b.Date))
            .ToListAsync(cancellationToken);
    }

    public async Task<BirthdayDto> CreateAsync(CreateBirthdayRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var birthday = new Birthday
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Name = request.Name.Trim(),
            Date = request.Date,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.Birthdays.Add(birthday);
        await db.SaveChangesAsync(cancellationToken);

        return new BirthdayDto(birthday.Id, birthday.Name, birthday.Date);
    }

    public async Task<BirthdayDto?> UpdateAsync(Guid id, UpdateBirthdayRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();
        var birthday = await db.Birthdays.FirstOrDefaultAsync(b => b.Id == id && b.FamilyId == familyId, cancellationToken);
        if (birthday is null)
        {
            return null;
        }

        birthday.Name = request.Name.Trim();
        birthday.Date = request.Date;
        await db.SaveChangesAsync(cancellationToken);

        return new BirthdayDto(birthday.Id, birthday.Name, birthday.Date);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var birthday = await db.Birthdays.FirstOrDefaultAsync(b => b.Id == id && b.FamilyId == familyId, cancellationToken);
        if (birthday is null)
        {
            return false;
        }

        db.Birthdays.Remove(birthday);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
