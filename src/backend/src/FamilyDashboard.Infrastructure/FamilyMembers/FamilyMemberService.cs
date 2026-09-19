using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.FamilyMembers;
using FamilyDashboard.Application.FamilyMembers.Dtos;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.FamilyMembers;

public sealed class FamilyMemberService(AppDbContext db, ICurrentUserService currentUser) : IFamilyMemberService
{
    public async Task<IReadOnlyList<FamilyMemberDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.FamilyMembers
            .Where(m => m.FamilyId == familyId)
            .OrderBy(m => m.Name)
            .Select(m => new FamilyMemberDto(m.Id, m.Name, m.Color))
            .ToListAsync(cancellationToken);
    }

    public async Task<FamilyMemberDto> CreateAsync(CreateFamilyMemberRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var member = new FamilyMember
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Name = request.Name.Trim(),
            Color = request.Color,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.FamilyMembers.Add(member);
        await db.SaveChangesAsync(cancellationToken);

        return new FamilyMemberDto(member.Id, member.Name, member.Color);
    }

    public async Task<FamilyMemberDto?> UpdateAsync(Guid id, UpdateFamilyMemberRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();
        var member = await db.FamilyMembers.FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == familyId, cancellationToken);
        if (member is null)
        {
            return null;
        }

        member.Name = request.Name.Trim();
        member.Color = request.Color;
        await db.SaveChangesAsync(cancellationToken);

        return new FamilyMemberDto(member.Id, member.Name, member.Color);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var member = await db.FamilyMembers.FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == familyId, cancellationToken);
        if (member is null)
        {
            return false;
        }

        db.FamilyMembers.Remove(member);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
