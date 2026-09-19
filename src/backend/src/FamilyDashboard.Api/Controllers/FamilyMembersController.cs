using FamilyDashboard.Application.FamilyMembers;
using FamilyDashboard.Application.FamilyMembers.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

// AllowAnonymous on every action: no auth scheme is registered yet (Phase 2 adds
// Google OAuth — see AuthenticationExtensions.cs), so [Authorize] would throw at
// request time. Family-scoping is still real: every service call is scoped by
// ICurrentUserService.FamilyId, which Phase 2 swaps for a real authenticated claim.
[ApiController]
[Route("api/family-members")]
[AllowAnonymous]
public sealed class FamilyMembersController(IFamilyMemberService familyMemberService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FamilyMemberDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await familyMemberService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<FamilyMemberDto>> Create(CreateFamilyMemberRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await familyMemberService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FamilyMemberDto>> Update(Guid id, UpdateFamilyMemberRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await familyMemberService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await familyMemberService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
