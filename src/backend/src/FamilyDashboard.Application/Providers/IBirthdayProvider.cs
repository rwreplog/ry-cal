using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IBirthdayProvider
{
    Task<IReadOnlyList<UpcomingBirthdayDto>> GetUpcomingBirthdaysAsync(CancellationToken cancellationToken);
}
