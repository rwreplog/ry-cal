using FamilyDashboard.Application.Announcements;
using FamilyDashboard.Application.Announcements.Dtos;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Announcements;

public sealed class AnnouncementService(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : IAnnouncementService
{
    public async Task<IReadOnlyList<AnnouncementDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.Announcements
            .Where(a => a.FamilyId == familyId)
            .OrderByDescending(a => a.PostedAtUtc)
            .Select(a => new AnnouncementDto(a.Id, a.Message, a.PostedBy, a.PostedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<AnnouncementDto> CreateAsync(CreateAnnouncementRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            throw new ArgumentException("Message is required.", nameof(request));
        }

        var now = timeProvider.GetUtcNow();
        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Message = request.Message.Trim(),
            PostedBy = string.IsNullOrWhiteSpace(request.PostedBy) ? null : request.PostedBy.Trim(),
            PostedAtUtc = now,
            CreatedAtUtc = now,
        };

        db.Announcements.Add(announcement);
        await db.SaveChangesAsync(cancellationToken);

        return new AnnouncementDto(announcement.Id, announcement.Message, announcement.PostedBy, announcement.PostedAtUtc);
    }

    public async Task<AnnouncementDto?> UpdateAsync(Guid id, UpdateAnnouncementRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            throw new ArgumentException("Message is required.", nameof(request));
        }

        var familyId = CurrentFamilyId();
        var announcement = await db.Announcements.FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId, cancellationToken);
        if (announcement is null)
        {
            return null;
        }

        announcement.Message = request.Message.Trim();
        announcement.PostedBy = string.IsNullOrWhiteSpace(request.PostedBy) ? null : request.PostedBy.Trim();
        await db.SaveChangesAsync(cancellationToken);

        return new AnnouncementDto(announcement.Id, announcement.Message, announcement.PostedBy, announcement.PostedAtUtc);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var announcement = await db.Announcements.FirstOrDefaultAsync(a => a.Id == id && a.FamilyId == familyId, cancellationToken);
        if (announcement is null)
        {
            return false;
        }

        db.Announcements.Remove(announcement);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
