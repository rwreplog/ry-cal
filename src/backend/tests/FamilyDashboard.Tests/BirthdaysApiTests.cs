using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.Birthdays.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class BirthdaysApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var name = $"Test Birthday {Guid.NewGuid():N}";
        var date = new DateOnly(1985, 6, 15);

        var createResponse = await client.PostAsJsonAsync("/api/birthdays", new CreateBirthdayRequest(name, date));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<BirthdayDto>();
        Assert.NotNull(created);
        Assert.Equal(name, created!.Name);
        Assert.Equal(date, created.Date);

        var listResponse = await client.GetFromJsonAsync<List<BirthdayDto>>("/api/birthdays");
        Assert.Contains(listResponse!, b => b.Id == created.Id);

        var updatedName = $"{name} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/birthdays/{created.Id}", new UpdateBirthdayRequest(updatedName, date));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<BirthdayDto>();
        Assert.Equal(updatedName, updated!.Name);

        var deleteResponse = await client.DeleteAsync($"/api/birthdays/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/birthdays/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankName_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/birthdays", new CreateBirthdayRequest("   ", new DateOnly(2000, 1, 1)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
