using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class DemoWeatherProvider : IWeatherProvider
{
    public Task<WeatherSnapshotDto> GetCurrentConditionsAsync(CancellationToken cancellationToken) =>
        Task.FromResult(DemoData.BuildCurrentConditions());
}
