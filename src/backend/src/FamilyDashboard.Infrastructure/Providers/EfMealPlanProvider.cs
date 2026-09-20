using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class EfMealPlanProvider(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : IMealPlanProvider
{
    private const int DashboardMealLimit = 5;

    public async Task<IReadOnlyList<MealPlanSummaryDto>> GetUpcomingMealsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);

        return await db.MealPlanEntries
            .Where(m => m.FamilyId == familyId && m.Date >= today)
            .OrderBy(m => m.Date)
            .Take(DashboardMealLimit)
            .Select(m => new MealPlanSummaryDto(m.Id.ToString(), m.Date, m.Name, m.Description))
            .ToListAsync(cancellationToken);
    }
}
