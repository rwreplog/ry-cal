using FamilyDashboard.Application.Meals.Dtos;

namespace FamilyDashboard.Application.Meals;

public interface IMealPlanService
{
    Task<IReadOnlyList<MealPlanEntryDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<MealPlanEntryDto> CreateAsync(CreateMealPlanEntryRequest request, CancellationToken cancellationToken);

    Task<MealPlanEntryDto?> UpdateAsync(Guid id, UpdateMealPlanEntryRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
