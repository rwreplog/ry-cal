using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IAnnouncementProvider
{
    Task<IReadOnlyList<AnnouncementDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken);
}
