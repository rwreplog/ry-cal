using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface ICountdownProvider
{
    Task<IReadOnlyList<CountdownSummaryDto>> GetActiveCountdownsAsync(CancellationToken cancellationToken);
}
