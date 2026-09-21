using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FamilyDashboard.Infrastructure.Providers;

// Real weather data for the dashboard widget, replacing DemoWeatherProvider.
// Open-Meteo (open-meteo.com) — free, no API key/signup — fits a self-hosted
// single-household app far better than a keyed provider: no secret to manage, no
// account/rate-limit juggling.
public sealed class OpenMeteoWeatherProvider(
    AppDbContext db,
    ICurrentUserService currentUser,
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache) : IWeatherProvider
{
    // Weather changes slowly — doesn't need per-request freshness like calendar/ICS.
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(20);

    public async Task<WeatherSnapshotDto?> GetCurrentConditionsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return null;
        }

        var cacheKey = $"weather:{familyId}";
        // TryGetValue with the nullable inner type: a cached null (no location, or a
        // prior fetch failed) still needs to short-circuit here rather than fall
        // through and refetch every call — cache.Set below stores null the same way
        // CalendarProvider caches a failed fetch's [] result, so a flaky upstream or
        // a not-yet-configured location doesn't get hammered every dashboard poll.
        if (cache.TryGetValue(cacheKey, out WeatherSnapshotDto? cached))
        {
            return cached;
        }

        var dashboard = await db.Dashboards
            .Where(d => d.FamilyId == familyId)
            .Select(d => new { d.Latitude, d.Longitude })
            .SingleOrDefaultAsync(cancellationToken);

        WeatherSnapshotDto? result = null;
        if (dashboard is { Latitude: { } lat, Longitude: { } lon })
        {
            result = await FetchAsync(lat, lon, cancellationToken);
        }

        cache.Set(cacheKey, result, CacheDuration);
        return result;
    }

    private async Task<WeatherSnapshotDto?> FetchAsync(double latitude, double longitude, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient("open-meteo");
        var url = "https://api.open-meteo.com/v1/forecast" +
                  $"?latitude={latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}" +
                  $"&longitude={longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}" +
                  "&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code" +
                  "&temperature_unit=fahrenheit&timezone=auto&forecast_days=1";

        try
        {
            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<ForecastResponse>(cancellationToken: cancellationToken);
            if (payload?.Current is null)
            {
                return null;
            }

            var highF = payload.Daily?.TemperatureMax?.FirstOrDefault() ?? payload.Current.Temperature;
            var lowF = payload.Daily?.TemperatureMin?.FirstOrDefault() ?? payload.Current.Temperature;
            // Falls back to the current moment's code if the daily block is somehow
            // missing it — still a reasonable "what to expect today" signal.
            var dailyCode = payload.Daily?.WeatherCode?.FirstOrDefault() ?? payload.Current.WeatherCode;

            return new WeatherSnapshotDto(
                payload.Current.Temperature,
                DescribeWeatherCode(payload.Current.WeatherCode),
                highF,
                lowF,
                IsInclementWeather(dailyCode),
                DescribeWeatherCode(dailyCode));
        }
        catch
        {
            return null; // fail soft — a flaky upstream must never break the dashboard
        }
    }

    // WMO weather codes (https://open-meteo.com/en/docs) — extracted as a standalone
    // pure function so the mapping is unit-testable without mocking HTTP.
    internal static string DescribeWeatherCode(int code) => code switch
    {
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Overcast",
        45 or 48 => "Fog",
        51 or 53 or 55 => "Drizzle",
        56 or 57 => "Freezing drizzle",
        61 or 63 or 65 => "Rain",
        66 or 67 => "Freezing rain",
        71 or 73 or 75 => "Snow",
        77 => "Snow grains",
        80 or 81 or 82 => "Rain showers",
        85 or 86 => "Snow showers",
        95 => "Thunderstorm",
        96 or 99 => "Thunderstorm with hail",
        _ => "Unknown",
    };

    // Every WMO code from drizzle (51) up is some form of precipitation — fog
    // (45/48) is a visibility hazard, not "inclement" in the usual sense, so it's
    // deliberately excluded. Based on the *daily* code (today's dominant/forecast
    // condition), not the current moment's, so this answers "should I expect rain
    // or snow today," not just "is it raining right now."
    internal static bool IsInclementWeather(int code) => code >= 51;

    private sealed record ForecastResponse(
        [property: JsonPropertyName("current")] CurrentConditions? Current,
        [property: JsonPropertyName("daily")] DailyConditions? Daily);

    private sealed record CurrentConditions(
        [property: JsonPropertyName("temperature_2m")] double Temperature,
        [property: JsonPropertyName("weather_code")] int WeatherCode);

    private sealed record DailyConditions(
        [property: JsonPropertyName("temperature_2m_max")] IReadOnlyList<double>? TemperatureMax,
        [property: JsonPropertyName("temperature_2m_min")] IReadOnlyList<double>? TemperatureMin,
        [property: JsonPropertyName("weather_code")] IReadOnlyList<int>? WeatherCode);
}
