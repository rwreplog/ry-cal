using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IWeatherProvider
{
    Task<WeatherSnapshotDto?> GetCurrentConditionsAsync(CancellationToken cancellationToken);
}
