using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyDashboard.Tests;

public class CalendarApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetConnection_NeverReturnsNoContent()
    {
        // Regression test: ASP.NET Core's default output formatter silently rewrites
        // Ok(null) into 204 No Content, which breaks TanStack Query on the frontend
        // (it throws "Query data cannot be undefined" when a queryFn resolves to
        // undefined). The endpoint must always return 200 with a JSON body — an
        // object if connected, a literal `null` if not — never a bodyless 204.
        //
        // Deliberately doesn't assert "not connected": this app is single-family, and
        // the shared dev database this test runs against may have a real connection
        // from manual verification. Asserting a specific connection state here would
        // either be flaky against real usage or require disconnecting a real,
        // deliberately-established connection as a side effect of running tests —
        // never acceptable.
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/calendar/connections");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Connect_RedirectsToGoogleWithStateCookieAndCorrectRedirectUri()
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        var response = await client.GetAsync("/api/calendar/connect");

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        var location = response.Headers.Location!.ToString();
        Assert.StartsWith("https://accounts.google.com/o/oauth2/v2/auth?", location);
        Assert.Contains("scope=openid+email+https%3a%2f%2fwww.googleapis.com%2fauth%2fcalendar.readonly", location);
        // calendar.readonly alone doesn't cover CalendarList.list (Google returns
        // ACCESS_TOKEN_SCOPE_INSUFFICIENT) — calendarlist.readonly is required too.
        Assert.Contains("calendar.calendarlist.readonly", location);
        Assert.Contains("access_type=offline", location);
        Assert.Contains("prompt=consent", location);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
        Assert.Contains(cookies!, c => c.StartsWith("calendar_oauth_state="));
    }
}
