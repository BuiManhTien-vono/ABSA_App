using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Infrastructure.Data;
using HigenAbsa.Infrastructure.Services.Inference;
using HigenAbsa.Application.Common;
using HigenAbsa.Application.Services;
using HigenAbsa.Application.Services.Auth;
using HigenAbsa.Application.Services.Inference;
using HigenAbsa.Application.Services.Lazada;
using HigenAbsa.Application.DTOs;
using HigenAbsa.Application.DTOs.Auth;
using HigenAbsa.Application.DTOs.Inference;
using HigenAbsa.Application.DTOs.Lazada;
// Controllers/AuditLogController.cs - Audit Log Endpoints (Admin only)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Application.DTOs.Audit;
using HigenAbsa.Application.Services.Audit;

namespace HigenAbsa.WebApi.Controllers;

[ApiController]
[Route("api/v1/audit-logs")]
[Authorize(Roles = "ADMIN")]
public class AuditLogController(IAuditLogService auditLogService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of system audit logs (Admin only).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AuditLogDto>), StatusCodes.Status200OK)]
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


