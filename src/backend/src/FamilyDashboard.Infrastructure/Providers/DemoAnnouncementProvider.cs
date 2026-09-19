using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class DemoAnnouncementProvider(TimeProvider timeProvider) : IAnnouncementProvider
{
    public Task<IReadOnlyList<AnnouncementDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(DemoData.BuildActiveAnnouncements(timeProvider.GetUtcNow()));
}
