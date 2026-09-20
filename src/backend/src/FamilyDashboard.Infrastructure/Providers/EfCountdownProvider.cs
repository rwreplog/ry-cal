using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

// Past-due countdowns are hidden from the dashboard (but stay visible, with a
// "Passed" badge, in the admin CRUD list — no auto-delete).
public sealed class EfCountdownProvider(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : ICountdownProvider
{
    public async Task<IReadOnlyList<CountdownSummaryDto>> GetActiveCountdownsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);

        var rows = await db.Countdowns
            .Where(c => c.FamilyId == familyId && c.TargetDate >= today)
            .OrderBy(c => c.TargetDate)
            .Select(c => new { c.Id, c.Label, c.TargetDate })
            .ToListAsync(cancellationToken);

        return rows
            .Select(c => new CountdownSummaryDto(c.Id.ToString(), c.Label, c.TargetDate, c.TargetDate.DayNumber - today.DayNumber))
            .ToList();
    }
}
