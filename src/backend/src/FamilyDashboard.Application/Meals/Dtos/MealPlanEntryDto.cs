namespace FamilyDashboard.Application.Meals.Dtos;

public sealed record MealPlanEntryDto(Guid Id, DateOnly Date, string Name, string? Description);

public sealed record CreateMealPlanEntryRequest(DateOnly Date, string Name, string? Description);

public sealed record UpdateMealPlanEntryRequest(DateOnly Date, string Name, string? Description);
