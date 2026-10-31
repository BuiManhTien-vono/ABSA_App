using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.Reporting.Application.DTOs;
using HigenAbsa.Modules.Reporting.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.Reporting.Endpoints;

[ApiController]
[Route("api/v1/audit-logs")]
[Authorize(Roles = "ADMIN")]
public class AuditLogController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? action = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? entityName = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var result = await auditLogService.GetAuditLogsAsync(
            page, pageSize, action, userId, entityName, dateFrom, dateTo);
        return Ok(result);
    }
}

