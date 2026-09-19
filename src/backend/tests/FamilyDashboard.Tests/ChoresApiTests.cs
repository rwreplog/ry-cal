using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FamilyDashboard.Application.Chores.Dtos;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.FamilyMembers.Dtos;
using FamilyDashboard.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class ChoresApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    private async Task<FamilyMemberDto> CreateFamilyMemberAsync(HttpClient client, string name)
    {
        var response = await client.PostAsJsonAsync("/api/family-members", new CreateFamilyMemberRequest(name, null), JsonOptions);
        var member = await response.Content.ReadFromJsonAsync<FamilyMemberDto>(JsonOptions);
        return member!;
    }

    [Fact]
    public async Task CreateAssignAndComplete_OneOffChore_MarksItComplete()
    {
        var client = factory.CreateClient();
        var member = await CreateFamilyMemberAsync(client, $"OneOff Member {Guid.NewGuid():N}");
        var title = $"Test Chore {Guid.NewGuid():N}";
        var dueAt = DateTimeOffset.UtcNow.AddHours(2);

        var createResponse = await client.PostAsJsonAsync(
            "/api/chores", new CreateChoreRequest(title, null, null, RecurrenceType.None, dueAt), JsonOptions);
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);
        var chore = await createResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);
        Assert.False(chore!.IsComplete);
        Assert.Null(chore.AssignedToFamilyMemberId);

        var assignResponse = await client.PatchAsJsonAsync(
            $"/api/chores/{chore.Id}/assign", new AssignChoreRequest(member.Id), JsonOptions);
        var assigned = await assignResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);
        Assert.Equal(member.Id, assigned!.AssignedToFamilyMemberId);
        Assert.Equal(member.Name, assigned.AssignedToName);

        var completeResponse = await client.PostAsJsonAsync(
            $"/api/chores/{chore.Id}/complete", new CompleteChoreRequest(member.Id), JsonOptions);
        var completed = await completeResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);
        Assert.True(completed!.IsComplete);
        Assert.NotNull(completed.LastCompletedAtUtc);
        AssertClose(dueAt, completed.DueAtUtc); // one-off: due date does not move

        var completions = await client.GetFromJsonAsync<List<ChoreCompletionDto>>(
            $"/api/chores/completions?choreId={chore.Id}", JsonOptions);
        Assert.Single(completions!);
        Assert.Equal(member.Id, completions![0].FamilyMemberId);
    }

    [Fact]
    public async Task Complete_RecurringChore_RollsDueDateForwardAndStaysIncomplete()
    {
        var client = factory.CreateClient();
        var member = await CreateFamilyMemberAsync(client, $"Recurring Member {Guid.NewGuid():N}");
        var title = $"Test Recurring Chore {Guid.NewGuid():N}";
        var dueAt = DateTimeOffset.UtcNow.AddHours(2);

        var createResponse = await client.PostAsJsonAsync(
            "/api/chores", new CreateChoreRequest(title, null, member.Id, RecurrenceType.Daily, dueAt), JsonOptions);
        var chore = await createResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);

        var completeResponse = await client.PostAsJsonAsync(
            $"/api/chores/{chore!.Id}/complete", new CompleteChoreRequest(member.Id), JsonOptions);
        var completed = await completeResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);

        Assert.False(completed!.IsComplete); // recurring chores never stay "done"
        AssertClose(dueAt.AddDays(1), completed.DueAtUtc);
    }

    // Postgres stores `timestamp with time zone` at microsecond precision, one digit
    // less than .NET's 100ns ticks, so exact equality after a DB round trip is too strict.
    private static void AssertClose(DateTimeOffset expected, DateTimeOffset actual) =>
        Assert.True(
            Math.Abs((expected - actual).TotalMilliseconds) < 1,
            $"Expected {expected:O} to be within 1ms of {actual:O}");

    [Fact]
    public async Task Create_WithBlankTitle_ReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/chores", new CreateChoreRequest("   ", null, null, RecurrenceType.None, DateTimeOffset.UtcNow), JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task IncompleteChore_AppearsOnDashboard_AndDisappearsAfterCompletion()
    {
        var client = factory.CreateClient();
        var member = await CreateFamilyMemberAsync(client, $"Dashboard Member {Guid.NewGuid():N}");
        var title = $"Dashboard Chore {Guid.NewGuid():N}";
        var dueAt = DateTimeOffset.UtcNow.AddHours(1);

        var createResponse = await client.PostAsJsonAsync(
            "/api/chores", new CreateChoreRequest(title, null, member.Id, RecurrenceType.None, dueAt), JsonOptions);
        var chore = await createResponse.Content.ReadFromJsonAsync<ChoreDto>(JsonOptions);

        var dashboardBefore = await client.GetFromJsonAsync<DashboardDto>("/api/dashboard", JsonOptions);
        Assert.Contains(dashboardBefore!.Chores.Items, c => c.Id == chore!.Id.ToString());

        await client.PostAsJsonAsync($"/api/chores/{chore!.Id}/complete", new CompleteChoreRequest(member.Id), JsonOptions);

        var dashboardAfter = await client.GetFromJsonAsync<DashboardDto>("/api/dashboard", JsonOptions);
        Assert.DoesNotContain(dashboardAfter!.Chores.Items, c => c.Id == chore.Id.ToString());
    }
}
