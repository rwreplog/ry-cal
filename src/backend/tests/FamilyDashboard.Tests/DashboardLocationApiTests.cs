using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.Dashboard.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class DashboardLocationApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetLocation_NeverErrors()
    {
        // Deliberately doesn't assert a specific location — this app is single-family
        // and the shared dev database may have a real location set from manual
        // verification. Same rationale as CalendarApiTests.GetConnection_NeverReturnsNoContent.
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/dashboard/location");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UpdateLocation_RoundTrips()
    {
        // This DB is shared with manual browser verification — capture the original
        // location and restore it before the test ends.
        var client = factory.CreateClient();
        var original = await client.GetFromJsonAsync<HouseholdLocationDto>("/api/dashboard/location");
        Assert.NotNull(original);

        try
        {
            var request = new UpdateHouseholdLocationRequest(41.8781, -87.6298, "Chicago, Illinois, United States");
            var putResponse = await client.PutAsJsonAsync("/api/dashboard/location", request);
            Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);
            var updated = await putResponse.Content.ReadFromJsonAsync<HouseholdLocationDto>();
            Assert.Equal(41.8781, updated!.Latitude);
            Assert.Equal(-87.6298, updated.Longitude);
            Assert.Equal("Chicago, Illinois, United States", updated.LocationLabel);

            var fetched = await client.GetFromJsonAsync<HouseholdLocationDto>("/api/dashboard/location");
            Assert.Equal(41.8781, fetched!.Latitude);
        }
        finally
        {
            // If a location was already set, restore it exactly. If none was set yet,
            // there's no "clear" endpoint to restore to that state — acceptable here
            // since the household sets its real location via the UI during manual
            // verification anyway, which naturally overwrites this test's value.
            if (original!.Latitude is { } lat && original.Longitude is { } lon)
            {
                await client.PutAsJsonAsync("/api/dashboard/location", new UpdateHouseholdLocationRequest(lat, lon, original.LocationLabel));
            }
        }
    }

    [Fact]
    public async Task UpdateLocation_WithInvalidLatitude_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync("/api/dashboard/location", new UpdateHouseholdLocationRequest(200, 0, null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SearchLocations_ReturnsOkForAQuery()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/dashboard/location/search?q=Chicago");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
