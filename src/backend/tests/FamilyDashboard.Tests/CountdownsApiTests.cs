using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.Countdowns.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class CountdownsApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var label = $"Test Countdown {Guid.NewGuid():N}";
        var targetDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(30);

        var createResponse = await client.PostAsJsonAsync("/api/countdowns", new CreateCountdownRequest(label, targetDate));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CountdownDto>();
        Assert.NotNull(created);
        Assert.Equal(label, created!.Label);
        Assert.Equal(targetDate, created.TargetDate);

        var listResponse = await client.GetFromJsonAsync<List<CountdownDto>>("/api/countdowns");
        Assert.Contains(listResponse!, c => c.Id == created.Id);

        var updatedLabel = $"{label} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/countdowns/{created.Id}", new UpdateCountdownRequest(updatedLabel, targetDate));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<CountdownDto>();
        Assert.Equal(updatedLabel, updated!.Label);

        var deleteResponse = await client.DeleteAsync($"/api/countdowns/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/countdowns/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankLabel_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/countdowns", new CreateCountdownRequest("   ", DateOnly.FromDateTime(DateTime.UtcNow)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
