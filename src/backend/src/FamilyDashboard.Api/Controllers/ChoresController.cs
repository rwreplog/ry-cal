using FamilyDashboard.Application.Chores;
using FamilyDashboard.Application.Chores.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

// AllowAnonymous on every action: no auth scheme is registered yet (Phase 2 adds
// Google OAuth — see AuthenticationExtensions.cs), so [Authorize] would throw at
// request time. Family-scoping is still real: every service call is scoped by
// ICurrentUserService.FamilyId, which Phase 2 swaps for a real authenticated claim.
[ApiController]
[Route("api/chores")]
[AllowAnonymous]
public sealed class ChoresController(IChoreService choreService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ChoreDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await choreService.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ChoreDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var chore = await choreService.GetByIdAsync(id, cancellationToken);
        return chore is null ? NotFound() : Ok(chore);
    }

    [HttpPost]
    public async Task<ActionResult<ChoreDto>> Create(CreateChoreRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await choreService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ChoreDto>> Update(Guid id, UpdateChoreRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await choreService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await choreService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPatch("{id:guid}/assign")]
    public async Task<ActionResult<ChoreDto>> Assign(Guid id, AssignChoreRequest request, CancellationToken cancellationToken)
    {
        var updated = await choreService.AssignAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ChoreDto>> Complete(Guid id, CompleteChoreRequest request, CancellationToken cancellationToken)
    {
        var updated = await choreService.CompleteAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpGet("completions")]
    public async Task<ActionResult<IReadOnlyList<ChoreCompletionDto>>> GetCompletions(
        [FromQuery] Guid? choreId, [FromQuery] Guid? familyMemberId, [FromQuery] int take, CancellationToken cancellationToken)
    {
        var effectiveTake = take is > 0 and <= 200 ? take : 50;
        return Ok(await choreService.GetCompletionHistoryAsync(choreId, familyMemberId, effectiveTake, cancellationToken));
    }
}
