using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IChoreProvider
{
    Task<IReadOnlyList<ChoreSummaryDto>> GetActiveChoresAsync(CancellationToken cancellationToken);
}
