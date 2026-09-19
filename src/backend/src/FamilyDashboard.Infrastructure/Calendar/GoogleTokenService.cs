using System.Net;
using System.Net.Http.Json;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using FamilyDashboard.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FamilyDashboard.Infrastructure.Calendar;

// Hands back a valid plaintext access token for a family's Google calendar
// connection, refreshing it first if it's near expiry. Never logs or otherwise
// surfaces the plaintext token beyond the return value.
public sealed class GoogleTokenService(
    AppDbContext db,
    IHttpClientFactory httpClientFactory,
    ITokenProtector tokenProtector,
    IOptions<GoogleOAuthOptions> options,
    TimeProvider timeProvider)
{
    public async Task<string?> GetValidAccessTokenAsync(Guid familyId, CancellationToken cancellationToken)
    {
        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        if (connection is null
            || connection.Provider != CalendarConnectionProvider.Google
            || connection.RefreshTokenEncrypted is null)
        {
            return null;
        }

        var now = timeProvider.GetUtcNow();
        if (connection.AccessTokenExpiresAtUtc > now.AddMinutes(1) && connection.AccessTokenEncrypted is not null)
        {
            return tokenProtector.Unprotect(connection.AccessTokenEncrypted);
        }

        var client = httpClientFactory.CreateClient("google-oauth");
        var response = await client.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = options.Value.ClientId,
                ["client_secret"] = options.Value.ClientSecret,
                ["refresh_token"] = tokenProtector.Unprotect(connection.RefreshTokenEncrypted),
                ["grant_type"] = "refresh_token",
            }),
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            // invalid_grant: access was revoked on Google's side. The connection is
            // permanently dead — remove it so GetConnectionAsync correctly reports
            // "not connected" instead of retrying forever.
            db.CalendarConnections.Remove(connection);
            await db.SaveChangesAsync(cancellationToken);
            return null;
        }

        if (!response.IsSuccessStatusCode)
        {
            return null; // transient failure — don't break the dashboard, try again next call
        }

        var payload = await response.Content.ReadFromJsonAsync<GoogleTokenRefreshResponse>(cancellationToken: cancellationToken);
        if (payload is null)
        {
            return null;
        }

        connection.AccessTokenEncrypted = tokenProtector.Protect(payload.AccessToken);
        connection.AccessTokenExpiresAtUtc = now.AddSeconds(payload.ExpiresIn);
        connection.UpdatedAtUtc = now;
        await db.SaveChangesAsync(cancellationToken);

        return payload.AccessToken;
    }

    public async Task<string?> GetCalendarIdAsync(Guid familyId, CancellationToken cancellationToken)
    {
        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        return connection?.CalendarId;
    }
}
