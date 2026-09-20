using FamilyDashboard.Application.Announcements.Dtos;

namespace FamilyDashboard.Application.Announcements;

public interface IAnnouncementService
{
    Task<IReadOnlyList<AnnouncementDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<AnnouncementDto> CreateAsync(CreateAnnouncementRequest request, CancellationToken cancellationToken);

    Task<AnnouncementDto?> UpdateAsync(Guid id, UpdateAnnouncementRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
