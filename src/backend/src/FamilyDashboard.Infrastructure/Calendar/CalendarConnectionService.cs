using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Web;
using FamilyDashboard.Application.Calendar;
using FamilyDashboard.Application.Calendar.Dtos;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using FamilyDashboard.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
// Alias: this file's own namespace (FamilyDashboard.Infrastructure.Calendar) collides
// with Ical.Net's `Calendar` class name.
using IcsCalendar = Ical.Net.Calendar;

namespace FamilyDashboard.Infrastructure.Calendar;

public sealed class CalendarConnectionService(
    AppDbContext db,
    ICurrentUserService currentUser,
    IHttpClientFactory httpClientFactory,
    ITokenProtector tokenProtector,
    IOptions<GoogleOAuthOptions> options,
    IMemoryCache cache,
    TimeProvider timeProvider,
    GoogleTokenService tokenService) : ICalendarConnectionService
{
    // calendar.readonly alone does not cover CalendarList.list (Google returns
    // ACCESS_TOKEN_SCOPE_INSUFFICIENT) — calendar.calendarlist.readonly is a
    // separate, narrower scope specifically for listing the account's calendars.
    private const string Scope =
        "openid email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly";

    public string BuildAuthorizationUrl(string state, string redirectUri)
    {
        var query = HttpUtility.ParseQueryString(string.Empty);
        query["client_id"] = options.Value.ClientId;
        query["redirect_uri"] = redirectUri;
        query["response_type"] = "code";
        query["scope"] = Scope;
        query["access_type"] = "offline";
        query["prompt"] = "consent";
        query["state"] = state;

        return $"https://accounts.google.com/o/oauth2/v2/auth?{query}";
    }

    public async Task<bool> CompleteConnectionAsync(string code, string redirectUri, CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return false;
        }

        var client = httpClientFactory.CreateClient("google-oauth");
        var response = await client.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = options.Value.ClientId,
                ["client_secret"] = options.Value.ClientSecret,
                ["code"] = code,
                ["redirect_uri"] = redirectUri,
                ["grant_type"] = "authorization_code",
            }),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        var payload = await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(cancellationToken: cancellationToken);
        if (payload is null || payload.RefreshToken is null || payload.IdToken is null)
        {
            return false;
        }

        var email = ExtractEmail(payload.IdToken);
        if (email is null)
        {
            return false;
        }

        var now = timeProvider.GetUtcNow();
        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        if (connection is null)
        {
            connection = new CalendarConnection
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                CreatedAtUtc = now,
            };
            db.CalendarConnections.Add(connection);
        }

        connection.Provider = CalendarConnectionProvider.Google;
        connection.ConnectedEmail = email;
        connection.AccessTokenEncrypted = tokenProtector.Protect(payload.AccessToken);
        connection.RefreshTokenEncrypted = tokenProtector.Protect(payload.RefreshToken);
        connection.AccessTokenExpiresAtUtc = now.AddSeconds(payload.ExpiresIn);
        connection.IcsUrl = null; // switching (back) to Google clears any prior ICS feed
        connection.UpdatedAtUtc = now;

        await db.SaveChangesAsync(cancellationToken);
        cache.Remove($"calendar:{familyId}");
        return true;
    }

    public async Task<CalendarConnectionDto?> ConnectIcsAsync(string icsUrl, CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return null;
        }

        var normalizedUrl = NormalizeIcsUrl(icsUrl);

        // Validate the feed is actually reachable and parseable before saving it —
        // better to fail here with a clear error than silently break the dashboard.
        var client = httpClientFactory.CreateClient("ics-feed");
        HttpResponseMessage response;
        try
        {
            response = await client.GetAsync(normalizedUrl, cancellationToken);
        }
        catch
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        try
        {
            var icsText = await response.Content.ReadAsStringAsync(cancellationToken);
            IcsCalendar.Load(icsText);
        }
        catch
        {
            return null;
        }

        var now = timeProvider.GetUtcNow();
        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        if (connection is null)
        {
            connection = new CalendarConnection
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                CreatedAtUtc = now,
            };
            db.CalendarConnections.Add(connection);
        }

        connection.Provider = CalendarConnectionProvider.Ics;
        connection.IcsUrl = normalizedUrl;
        // Switching (back) to an ICS feed clears any prior Google connection fields.
        connection.ConnectedEmail = null;
        connection.AccessTokenEncrypted = null;
        connection.RefreshTokenEncrypted = null;
        connection.AccessTokenExpiresAtUtc = null;
        connection.UpdatedAtUtc = now;

        await db.SaveChangesAsync(cancellationToken);
        cache.Remove($"calendar:{familyId}");
        return ToDto(connection);
    }

    public async Task<CalendarConnectionDto?> GetConnectionAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return null;
        }

        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        return connection is null ? null : ToDto(connection);
    }

    public async Task<bool> DisconnectAsync(Guid id, CancellationToken cancellationToken)
    {
        var connection = await db.CalendarConnections.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (connection is null)
        {
            return false;
        }

        if (connection.Provider == CalendarConnectionProvider.Google && connection.RefreshTokenEncrypted is not null)
        {
            try
            {
                var client = httpClientFactory.CreateClient("google-oauth");
                var refreshToken = tokenProtector.Unprotect(connection.RefreshTokenEncrypted);
                await client.PostAsync($"https://oauth2.googleapis.com/revoke?token={Uri.EscapeDataString(refreshToken)}", null, cancellationToken);
            }
            catch
            {
                // Best-effort: a network hiccup talking to Google must never block the local disconnect.
            }
        }

        db.CalendarConnections.Remove(connection);
        await db.SaveChangesAsync(cancellationToken);
        cache.Remove($"calendar:{connection.FamilyId}");
        return true;
    }

    public async Task<IReadOnlyList<CalendarListItemDto>?> GetAvailableCalendarsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return null;
        }

        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        if (connection is null || connection.Provider != CalendarConnectionProvider.Google)
        {
            return null; // multi-calendar selection is a Google-only concept
        }

        var accessToken = await tokenService.GetValidAccessTokenAsync(familyId, cancellationToken);
        if (accessToken is null)
        {
            return null;
        }

        var client = httpClientFactory.CreateClient("google-calendar");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return [];
        }

        var payload = await response.Content.ReadFromJsonAsync<GoogleCalendarListResponse>(cancellationToken: cancellationToken);
        return payload?.Items?
            .Where(i => i.Id is not null && i.Summary is not null)
            .Select(i => new CalendarListItemDto(i.Id!, i.Summary!, i.Primary))
            .ToList() ?? [];
    }

    public async Task<CalendarConnectionDto?> UpdateSelectedCalendarAsync(Guid id, string calendarId, CancellationToken cancellationToken)
    {
        var connection = await db.CalendarConnections.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (connection is null || connection.Provider != CalendarConnectionProvider.Google)
        {
            return null;
        }

        connection.CalendarId = calendarId;
        connection.UpdatedAtUtc = timeProvider.GetUtcNow();
        await db.SaveChangesAsync(cancellationToken);
        cache.Remove($"calendar:{connection.FamilyId}");

        return ToDto(connection);
    }

    private static string NormalizeIcsUrl(string url) =>
        url.StartsWith("webcal://", StringComparison.OrdinalIgnoreCase) ? $"https://{url["webcal://".Length..]}" : url;

    private static CalendarConnectionDto ToDto(CalendarConnection connection) => new(
        connection.Id,
        connection.Provider.ToString(),
        connection.ConnectedEmail,
        connection.Provider == CalendarConnectionProvider.Google ? connection.CalendarId : null,
        connection.IcsUrl,
        connection.CreatedAtUtc);

    private static string? ExtractEmail(string idToken)
    {
        var parts = idToken.Split('.');
        if (parts.Length != 3)
        {
            return null;
        }

        var payloadJson = Base64UrlDecode(parts[1]);
        var payload = JsonSerializer.Deserialize<GoogleIdTokenPayload>(payloadJson);
        return payload?.Email;
    }

    private static string Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + (4 - padded.Length % 4) % 4, '=');
        return Encoding.UTF8.GetString(Convert.FromBase64String(padded));
    }
}
