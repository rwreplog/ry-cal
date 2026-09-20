using FamilyDashboard.Application.Dashboard;
using FamilyDashboard.Application.Dashboard.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyDashboard.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(
    IDashboardService dashboardService,
    IDashboardConfigService dashboardConfigService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken cancellationToken)
    {
        var dashboard = await dashboardService.GetDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }

    [HttpGet("config")]
    [AllowAnonymous]
    public async Task<ActionResult<DashboardConfigDto>> GetConfig(CancellationToken cancellationToken)
    {
        var config = await dashboardConfigService.GetConfigAsync(cancellationToken);
        return Ok(config);
    }

    [HttpPut("config")]
    [AllowAnonymous]
    public async Task<ActionResult<DashboardConfigDto>> UpdateConfig(
        UpdateDashboardConfigRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var config = await dashboardConfigService.UpdateConfigAsync(request, cancellationToken);
            return Ok(config);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
