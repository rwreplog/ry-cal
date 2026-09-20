using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Application.Meals.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class MealsApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    // Far-future, randomized dates — this DB is shared with manual verification and
    // other test runs, and Date has a real (FamilyId, Date) uniqueness constraint.
    private static DateOnly RandomFutureDate() =>
        DateOnly.FromDateTime(DateTime.UtcNow).AddDays(Random.Shared.Next(2000, 8000));

    [Fact]
    public async Task CreateGetUpdateDelete_RoundTripsThroughTheApi()
    {
        var client = factory.CreateClient();
        var date = RandomFutureDate();
        var name = $"Test Meal {Guid.NewGuid():N}";

        var createResponse = await client.PostAsJsonAsync("/api/meals", new CreateMealPlanEntryRequest(date, name, "A description"));
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<MealPlanEntryDto>();
        Assert.NotNull(created);
        Assert.Equal(name, created!.Name);
        Assert.Equal(date, created.Date);

        var listResponse = await client.GetFromJsonAsync<List<MealPlanEntryDto>>("/api/meals");
        Assert.Contains(listResponse!, m => m.Id == created.Id);

        var updatedName = $"{name} Updated";
        var updateResponse = await client.PutAsJsonAsync($"/api/meals/{created.Id}", new UpdateMealPlanEntryRequest(date, updatedName, null));
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<MealPlanEntryDto>();
        Assert.Equal(updatedName, updated!.Name);
        Assert.Null(updated.Description);

        var deleteResponse = await client.DeleteAsync($"/api/meals/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var deleteAgainResponse = await client.DeleteAsync($"/api/meals/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgainResponse.StatusCode);
    }

    [Fact]
    public async Task Create_WithBlankName_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/meals", new CreateMealPlanEntryRequest(RandomFutureDate(), "   ", null));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithADateAlreadyPlanned_ReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var date = RandomFutureDate();

        var firstResponse = await client.PostAsJsonAsync("/api/meals", new CreateMealPlanEntryRequest(date, "First meal", null));
        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        var first = await firstResponse.Content.ReadFromJsonAsync<MealPlanEntryDto>();

        var secondResponse = await client.PostAsJsonAsync("/api/meals", new CreateMealPlanEntryRequest(date, "Second meal", null));
        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);

        await client.DeleteAsync($"/api/meals/{first!.Id}");
    }
}
