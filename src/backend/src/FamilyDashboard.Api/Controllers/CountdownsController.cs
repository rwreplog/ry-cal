using FamilyDashboard.Application.Countdowns;
using FamilyDashboard.Application.Countdowns.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/countdowns")]
[AllowAnonymous]
public sealed class CountdownsController(ICountdownService countdownService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CountdownDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await countdownService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<CountdownDto>> Create(CreateCountdownRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await countdownService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CountdownDto>> Update(Guid id, UpdateCountdownRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await countdownService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await countdownService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
