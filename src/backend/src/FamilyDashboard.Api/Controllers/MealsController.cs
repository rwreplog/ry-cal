using FamilyDashboard.Application.Meals;
using FamilyDashboard.Application.Meals.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/meals")]
[AllowAnonymous]
public sealed class MealsController(IMealPlanService mealPlanService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MealPlanEntryDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await mealPlanService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<MealPlanEntryDto>> Create(CreateMealPlanEntryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await mealPlanService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MealPlanEntryDto>> Update(Guid id, UpdateMealPlanEntryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await mealPlanService.UpdateAsync(id, request, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await mealPlanService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
