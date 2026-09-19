using System.Text.Json.Serialization;

namespace FamilyDashboard.Infrastructure.Calendar;

internal sealed class GoogleTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("id_token")]
    public string? IdToken { get; set; }
}

internal sealed class GoogleTokenRefreshResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
}

internal sealed class GoogleIdTokenPayload
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("aud")]
    public string? Audience { get; set; }
}

internal sealed class GoogleEventsResponse
{
    [JsonPropertyName("items")]
    public List<GoogleEventItem>? Items { get; set; }
}

internal sealed class GoogleEventItem
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("start")]
    public GoogleEventDateTime? Start { get; set; }

    [JsonPropertyName("end")]
    public GoogleEventDateTime? End { get; set; }
}

internal sealed class GoogleEventDateTime
{
    [JsonPropertyName("dateTime")]
    public string? DateTime { get; set; }

    [JsonPropertyName("date")]
    public string? Date { get; set; }
}

internal sealed class GoogleCalendarListResponse
{
    [JsonPropertyName("items")]
    public List<GoogleCalendarListItem>? Items { get; set; }
}

internal sealed class GoogleCalendarListItem
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("primary")]
    public bool Primary { get; set; }
}
