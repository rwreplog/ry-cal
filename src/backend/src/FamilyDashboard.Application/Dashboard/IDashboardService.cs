using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Dashboard;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(CancellationToken cancellationToken);
}
