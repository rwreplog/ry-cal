using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.ShoppingList.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class ShoppingListApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var name = $"Test Item {Guid.NewGuid():N}";

        var createResponse = await client.PostAsJsonAsync("/api/shopping-list", new CreateShoppingListItemRequest(name));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();
        Assert.NotNull(created);
        Assert.Equal(name, created!.Name);
        Assert.False(created.IsChecked);

        var listResponse = await client.GetFromJsonAsync<List<ShoppingListItemDto>>("/api/shopping-list");
        Assert.Contains(listResponse!, i => i.Id == created.Id);

        var updatedName = $"{name} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/shopping-list/{created.Id}", new UpdateShoppingListItemRequest(updatedName));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();
        Assert.Equal(updatedName, updated!.Name);

        var deleteResponse = await client.DeleteAsync($"/api/shopping-list/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/shopping-list/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankName_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/shopping-list", new CreateShoppingListItemRequest("   "));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Toggle_FlipsIsChecked()
    {
        var client = factory.CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/shopping-list", new CreateShoppingListItemRequest($"Toggle test {Guid.NewGuid():N}"));
        var created = await createResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();

        var toggleResponse = await client.PatchAsync($"/api/shopping-list/{created!.Id}/toggle", null);
        Assert.Equal(HttpStatusCode.OK, toggleResponse.StatusCode);
        var toggled = await toggleResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();
        Assert.True(toggled!.IsChecked);

        var toggleBackResponse = await client.PatchAsync($"/api/shopping-list/{created.Id}/toggle", null);
        var toggledBack = await toggleBackResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();
        Assert.False(toggledBack!.IsChecked);

        await client.DeleteAsync($"/api/shopping-list/{created.Id}");
    }

    [Fact]
    public async Task ClearChecked_RemovesOnlyCheckedItems()
    {
        var client = factory.CreateClient();
        var suffix = Guid.NewGuid().ToString("N");

        var keepResponse = await client.PostAsJsonAsync("/api/shopping-list", new CreateShoppingListItemRequest($"Keep {suffix}"));
        var keep = await keepResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();

        var removeResponse = await client.PostAsJsonAsync("/api/shopping-list", new CreateShoppingListItemRequest($"Remove {suffix}"));
        var remove = await removeResponse.Content.ReadFromJsonAsync<ShoppingListItemDto>();
        await client.PatchAsync($"/api/shopping-list/{remove!.Id}/toggle", null);

        var clearResponse = await client.DeleteAsync("/api/shopping-list/checked");
        Assert.Equal(HttpStatusCode.NoContent, clearResponse.StatusCode);

        var list = await client.GetFromJsonAsync<List<ShoppingListItemDto>>("/api/shopping-list");
        Assert.Contains(list!, i => i.Id == keep!.Id);
        Assert.DoesNotContain(list!, i => i.Id == remove.Id);

        await client.DeleteAsync($"/api/shopping-list/{keep!.Id}");
    }
}
