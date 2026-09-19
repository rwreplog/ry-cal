using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.FamilyMembers.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class FamilyMembersApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var name = $"Test Member {Guid.NewGuid():N}";

        var createResponse = await client.PostAsJsonAsync("/api/family-members", new CreateFamilyMemberRequest(name, "#ff0000"));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<FamilyMemberDto>();
        Assert.NotNull(created);
        Assert.Equal(name, created!.Name);

        var listResponse = await client.GetFromJsonAsync<List<FamilyMemberDto>>("/api/family-members");
        Assert.Contains(listResponse!, m => m.Id == created.Id);

        var updatedName = $"{name} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/family-members/{created.Id}", new UpdateFamilyMemberRequest(updatedName, null));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<FamilyMemberDto>();
        Assert.Equal(updatedName, updated!.Name);
        Assert.Null(updated.Color);

        var deleteResponse = await client.DeleteAsync($"/api/family-members/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/family-members/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankName_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/family-members", new CreateFamilyMemberRequest("   ", null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
