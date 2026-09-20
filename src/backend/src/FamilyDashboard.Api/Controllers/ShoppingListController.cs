using FamilyDashboard.Application.ShoppingList;
using FamilyDashboard.Application.ShoppingList.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/shopping-list")]
[AllowAnonymous]
public sealed class ShoppingListController(IShoppingListService shoppingListService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShoppingListItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await shoppingListService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingListItemDto>> Create(CreateShoppingListItemRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await shoppingListService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShoppingListItemDto>> Update(Guid id, UpdateShoppingListItemRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await shoppingListService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await shoppingListService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<ActionResult<ShoppingListItemDto>> Toggle(Guid id, CancellationToken cancellationToken)
    {
        var updated = await shoppingListService.ToggleCheckedAsync(id, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("checked")]
    public async Task<IActionResult> ClearChecked(CancellationToken cancellationToken)
    {
        await shoppingListService.ClearCheckedAsync(cancellationToken);
        return NoContent();
    }
}
