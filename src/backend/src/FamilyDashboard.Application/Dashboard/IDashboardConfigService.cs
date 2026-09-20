using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Dashboard;

public interface IDashboardConfigService
{
    Task<DashboardConfigDto> GetConfigAsync(CancellationToken cancellationToken);

    Task<DashboardConfigDto> UpdateConfigAsync(UpdateDashboardConfigRequest request, CancellationToken cancellationToken);
}
