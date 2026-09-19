using FamilyDashboard.Application.Common;
using FamilyDashboard.Infrastructure.Persistence;

namespace FamilyDashboard.Infrastructure.Auth;

// Stub implementation: Phase 0/1 have no real authentication (Google OAuth lands in
// Phase 2). This lets Application-layer code depend on ICurrentUserService now
// and be wired to a real identity later without changing call sites.
public sealed class CurrentUserService : ICurrentUserService
{
    public bool IsAuthenticated => false;

    public string? UserId => null;

    // Phase 2 hookup point: read the family id from the authenticated principal instead.
    public string? FamilyId => SeedData.DefaultFamilyId.ToString();
}
