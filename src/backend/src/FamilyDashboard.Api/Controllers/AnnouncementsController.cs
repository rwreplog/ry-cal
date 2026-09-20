using FamilyDashboard.Application.Announcements;
using FamilyDashboard.Application.Announcements.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/announcements")]
[AllowAnonymous]
public sealed class AnnouncementsController(IAnnouncementService announcementService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AnnouncementDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await announcementService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<AnnouncementDto>> Create(CreateAnnouncementRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await announcementService.CreateAsync(request, cancellationToken);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AnnouncementDto>> Update(Guid id, UpdateAnnouncementRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await announcementService.UpdateAsync(id, request, cancellationToken);
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
        var deleted = await announcementService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
