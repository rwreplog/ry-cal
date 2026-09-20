using FamilyDashboard.Application.Birthdays;
using FamilyDashboard.Application.Birthdays.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/birthdays")]
[AllowAnonymous]
public sealed class BirthdaysController(IBirthdayService birthdayService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BirthdayDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await birthdayService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<BirthdayDto>> Create(CreateBirthdayRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await birthdayService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BirthdayDto>> Update(Guid id, UpdateBirthdayRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await birthdayService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await birthdayService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
