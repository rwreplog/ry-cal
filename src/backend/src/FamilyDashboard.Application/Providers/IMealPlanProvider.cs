using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

public interface IMealPlanProvider
{
    Task<IReadOnlyList<MealPlanSummaryDto>> GetUpcomingMealsAsync(CancellationToken cancellationToken);
}
