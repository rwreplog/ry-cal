namespace FamilyDashboard.Api.Extensions;

// Phase 0 registers the authentication/authorization pipeline structure only.
// No scheme is added yet (no Google OAuth) — see ADR-002 and docs/ROADMAP.md
// Phase 2. GetDashboardAsync stays anonymous until real login exists.
public static class AuthenticationExtensions
{
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication();
        services.AddAuthorization();

        return services;
    }
}
