using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.Announcements.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class AnnouncementsApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var message = $"Test announcement {Guid.NewGuid():N}";

        var createResponse = await client.PostAsJsonAsync("/api/announcements", new CreateAnnouncementRequest(message, "Mom"));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<AnnouncementDto>();
        Assert.NotNull(created);
        Assert.Equal(message, created!.Message);
        Assert.Equal("Mom", created.PostedBy);

        var listResponse = await client.GetFromJsonAsync<List<AnnouncementDto>>("/api/announcements");
        Assert.Contains(listResponse!, a => a.Id == created.Id);

        var updatedMessage = $"{message} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/announcements/{created.Id}", new UpdateAnnouncementRequest(updatedMessage, null));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<AnnouncementDto>();
        Assert.Equal(updatedMessage, updated!.Message);
        Assert.Null(updated.PostedBy);

        var deleteResponse = await client.DeleteAsync($"/api/announcements/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/announcements/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankMessage_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/announcements", new CreateAnnouncementRequest("   ", null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
