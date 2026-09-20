using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;

namespace FamilyDashboard.Infrastructure.Providers;

// Thin proxy to Open-Meteo's free geocoding API (no key required) so the admin can
// search "Chicago" instead of typing raw lat/long. Matches ADR-003 ("backend owns
// integrations") even though there's no secret here, for consistency.
public sealed class OpenMeteoGeocodingService(IHttpClientFactory httpClientFactory) : IGeocodingService
{
    public async Task<IReadOnlyList<GeocodingResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var client = httpClientFactory.CreateClient("open-meteo-geocoding");
        var url = $"https://geocoding-api.open-meteo.com/v1/search?name={Uri.EscapeDataString(query.Trim())}&count=5&language=en&format=json";

        try
        {
            var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            var payload = await response.Content.ReadFromJsonAsync<GeocodingResponse>(cancellationToken: cancellationToken);
            return payload?.Results?
                .Select(r => new GeocodingResultDto(r.Name, r.Latitude, r.Longitude, r.Admin1, r.Country))
                .ToList() ?? [];
        }
        catch
        {
            return []; // fail soft — a flaky search never breaks the settings page
        }
    }

    private sealed record GeocodingResponse([property: JsonPropertyName("results")] IReadOnlyList<GeocodingResultItem>? Results);

    private sealed record GeocodingResultItem(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("latitude")] double Latitude,
        [property: JsonPropertyName("longitude")] double Longitude,
        [property: JsonPropertyName("admin1")] string? Admin1,
        [property: JsonPropertyName("country")] string Country);
}
