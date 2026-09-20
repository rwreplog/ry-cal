using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IGeocodingService
{
    Task<IReadOnlyList<GeocodingResultDto>> SearchAsync(string query, CancellationToken cancellationToken);
}
