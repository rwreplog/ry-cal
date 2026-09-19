using System.Security.Cryptography;
using FamilyDashboard.Application.Calendar;
using FamilyDashboard.Application.Calendar.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

// AllowAnonymous on every action: no auth scheme is registered (see
// AuthenticationExtensions.cs) and this phase is deliberately "connect the
// household's calendar," not a general login system — no session gating anywhere
// in the app. Family-scoping still works via ICurrentUserService.FamilyId, same as
// ChoresController/FamilyMembersController.
[ApiController]
[Route("api/calendar")]
[AllowAnonymous]
public sealed class CalendarController(ICalendarConnectionService connectionService, IConfiguration configuration) : ControllerBase
{
    private const string StateCookieName = "calendar_oauth_state";

    [HttpGet("connect")]
    public IActionResult Connect()
    {
        var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        Response.Cookies.Append(StateCookieName, state, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromMinutes(10),
        });

        return Redirect(connectionService.BuildAuthorizationUrl(state, CallbackUri()));
    }

    [HttpGet("connect/callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] string? code, [FromQuery] string? state, [FromQuery] string? error, CancellationToken cancellationToken)
    {
        var frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var expectedState = Request.Cookies[StateCookieName];
        Response.Cookies.Delete(StateCookieName);

        if (error is not null || code is null || state is null || state != expectedState)
        {
            return Redirect($"{frontendBaseUrl}/admin/calendar?connected=false&error=oauth_failed");
        }

        var connected = await connectionService.CompleteConnectionAsync(code, CallbackUri(), cancellationToken);
        return Redirect(connected
            ? $"{frontendBaseUrl}/admin/calendar?connected=true"
            : $"{frontendBaseUrl}/admin/calendar?connected=false&error=token_exchange_failed");
    }

    [HttpGet("connections")]
    public async Task<ActionResult<CalendarConnectionDto?>> GetConnection(CancellationToken cancellationToken)
    {
        // JsonResult (not Ok(...)) deliberately: ASP.NET Core's default output
        // formatter silently rewrites a null ObjectResult into 204 No Content,
        // which breaks callers expecting "200 + JSON null" for "not connected".
        var connection = await connectionService.GetConnectionAsync(cancellationToken);
        return new JsonResult(connection);
    }

    [HttpDelete("connections/{id:guid}")]
    public async Task<IActionResult> Disconnect(Guid id, CancellationToken cancellationToken) =>
        await connectionService.DisconnectAsync(id, cancellationToken) ? NoContent() : NotFound();

    [HttpPatch("connections/{id:guid}")]
    public async Task<ActionResult<CalendarConnectionDto>> UpdateSelectedCalendar(
        Guid id, UpdateSelectedCalendarRequest request, CancellationToken cancellationToken)
    {
        var updated = await connectionService.UpdateSelectedCalendarAsync(id, request.CalendarId, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpGet("calendars")]
    public async Task<ActionResult<IReadOnlyList<CalendarListItemDto>>> GetAvailableCalendars(CancellationToken cancellationToken) =>
        Ok(await connectionService.GetAvailableCalendarsAsync(cancellationToken) ?? []);

    [HttpPost("connect/ics")]
    public async Task<ActionResult<CalendarConnectionDto>> ConnectIcs(ConnectIcsRequest request, CancellationToken cancellationToken)
    {
        var result = await connectionService.ConnectIcsAsync(request.IcsUrl, cancellationToken);
        return result is null
            ? BadRequest("Couldn't load that calendar feed. Check the URL and try again.")
            : Ok(result);
    }

    private string CallbackUri() => $"{Request.Scheme}://{Request.Host}/api/calendar/connect/callback";
}
