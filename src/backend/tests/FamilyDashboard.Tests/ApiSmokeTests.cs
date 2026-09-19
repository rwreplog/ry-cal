using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FamilyDashboard.Application.Dashboard.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class ApiSmokeTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    [Fact]
    public async Task GetDashboard_ReturnsOkWithDemoData()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/dashboard");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dashboard = await response.Content.ReadFromJsonAsync<DashboardDto>(JsonOptions);
        Assert.NotNull(dashboard);
        Assert.NotEmpty(dashboard.Layout);
    }
}
