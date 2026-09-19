using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Persistence;

// This is an explicitly single-household app (docs/PRODUCT.md), so Phase 1 seeds
// exactly one Family rather than building multi-family onboarding. CurrentUserService
// resolves to this id until Phase 2 replaces it with a real authenticated claim.
public static class SeedData
{
    public static readonly Guid DefaultFamilyId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static async Task EnsureSeededAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Families.AnyAsync(cancellationToken))
        {
            return;
        }

        db.Families.Add(new Family
        {
            Id = DefaultFamilyId,
            Name = "Replogle Family",
            CreatedAtUtc = DateTimeOffset.UtcNow,
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}
