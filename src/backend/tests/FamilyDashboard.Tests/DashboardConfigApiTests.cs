using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FamilyDashboard.Application.Dashboard.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class DashboardConfigApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    [Fact]
    public async Task GetConfig_ReturnsNonEmptyWidgetList()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/dashboard/config");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var config = await response.Content.ReadFromJsonAsync<DashboardConfigDto>(JsonOptions);
        Assert.NotNull(config);
        Assert.NotEmpty(config!.Widgets);
    }

    [Fact]
    public async Task UpdateConfig_RoundTripsAndReflectsInDashboardLayout()
    {
        // This DB is shared with manual browser verification — capture the original
        // config and restore it before the test ends so it never leaves the family's
        // real dashboard configuration altered.
        var client = factory.CreateClient();
        var original = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
        Assert.NotNull(original);

        try
        {
            // Reorder (reverse), toggle the first widget's visibility off, change theme.
            var reordered = original!.Widgets
                .Reverse()
                .Select(w => new UpdateDashboardWidgetRequest(w.Type, w.Size, w.IsVisible))
                .ToList();
            reordered[0] = reordered[0] with { IsVisible = false };
            var request = new UpdateDashboardConfigRequest(reordered, "dark");

            var putResponse = await client.PutAsJsonAsync("/api/dashboard/config", request, JsonOptions);
            Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

            var updated = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
            Assert.NotNull(updated);
            Assert.Equal("dark", updated!.Theme);
            Assert.Equal(reordered.Select(w => w.Type), updated.Widgets.Select(w => w.Type));
            Assert.False(updated.Widgets.Single(w => w.Type == reordered[0].Type).IsVisible);

            var dashboard = await client.GetFromJsonAsync<DashboardDto>("/api/dashboard", JsonOptions);
            Assert.NotNull(dashboard);
            var expectedVisibleTypes = reordered.Where(w => w.IsVisible).Select(w => w.Type);
            Assert.Equal(expectedVisibleTypes, dashboard!.Layout.Select(w => w.Type));
        }
        finally
        {
            var restoreRequest = new UpdateDashboardConfigRequest(
                original.Widgets.Select(w => new UpdateDashboardWidgetRequest(w.Type, w.Size, w.IsVisible)).ToList(),
                original.Theme,
                original.CalendarView);
            await client.PutAsJsonAsync("/api/dashboard/config", restoreRequest, JsonOptions);
        }
    }

    [Fact]
    public async Task UpdateConfig_RejectsEmptyWidgetList()
    {
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync(
            "/api/dashboard/config",
            new UpdateDashboardConfigRequest([], "modern"),
            JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateConfig_PersistsCalendarView_AndKeepsItWhenOmitted()
    {
        var client = factory.CreateClient();
        var original = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
        Assert.NotNull(original);
        var widgets = original!.Widgets.Select(w => new UpdateDashboardWidgetRequest(w.Type, w.Size, w.IsVisible)).ToList();

        try
        {
            await client.PutAsJsonAsync("/api/dashboard/config", new UpdateDashboardConfigRequest(widgets, original.Theme, "rolling"), JsonOptions);
            var rolling = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
            Assert.Equal("rolling", rolling!.CalendarView);

            // A client that only edits widgets/theme must not reset the calendar view.
            await client.PutAsJsonAsync("/api/dashboard/config", new UpdateDashboardConfigRequest(widgets, original.Theme), JsonOptions);
            var kept = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
            Assert.Equal("rolling", kept!.CalendarView);
        }
        finally
        {
            await client.PutAsJsonAsync("/api/dashboard/config", new UpdateDashboardConfigRequest(widgets, original.Theme, original.CalendarView), JsonOptions);
        }
    }

    [Fact]
    public async Task UpdateConfig_RejectsUnknownCalendarView()
    {
        var client = factory.CreateClient();
        var original = await client.GetFromJsonAsync<DashboardConfigDto>("/api/dashboard/config", JsonOptions);
        var widgets = original!.Widgets.Select(w => new UpdateDashboardWidgetRequest(w.Type, w.Size, w.IsVisible)).ToList();

        var response = await client.PutAsJsonAsync("/api/dashboard/config", new UpdateDashboardConfigRequest(widgets, original.Theme, "fortnight"), JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
