using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.CoreSync.Endpoints;

[ApiController]
[Route("api/v1/customers")]
[Authorize]
public class CustomerController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CustomerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? riskLevel = null,
        [FromQuery] string? search = null)
    {
        var result = await customerService.GetCustomersAsync(page, pageSize, riskLevel, search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCustomerById(Guid id)
    {
        var customer = await customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound(new { detail = "Customer not found." });
        return Ok(customer);
    }

    [HttpPatch("{id:guid}/risk-level")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRiskLevel(Guid id, [FromBody] UpdateRiskLevelRequest request)
    {
        var updated = await customerService.UpdateRiskLevelAsync(id, request.RiskLevel);
        if (updated == null) return NotFound(new { detail = "Customer not found." });
        return Ok(updated);
    }
}

