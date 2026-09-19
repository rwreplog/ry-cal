namespace FamilyDashboard.Domain.Entities;

// One CalendarConnection per Family — enforced by a unique index on FamilyId.
// Fields below Provider are provider-specific: Google fields are populated when
// Provider == Google, IcsUrl when Provider == Ics. AccessToken/RefreshToken are
// stored encrypted at rest (see Infrastructure/Security/ITokenProtector) and never
// returned to the frontend.
public sealed class CalendarConnection
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public CalendarConnectionProvider Provider { get; set; } = CalendarConnectionProvider.Google;

    // Google only.
    public string? ConnectedEmail { get; set; }
    public string CalendarId { get; set; } = "primary";
    public string? AccessTokenEncrypted { get; set; }
    public string? RefreshTokenEncrypted { get; set; }
    public DateTimeOffset? AccessTokenExpiresAtUtc { get; set; }

    // Ics only — a public calendar feed URL (e.g. an iCloud "Public Calendar" share link).
    public string? IcsUrl { get; set; }

    public DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
