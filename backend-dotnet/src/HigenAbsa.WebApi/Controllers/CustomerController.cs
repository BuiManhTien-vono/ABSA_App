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
// Controllers/CustomerController.cs - Customer Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Application.DTOs.Customer;
using HigenAbsa.Application.Services.Customer;

namespace HigenAbsa.WebApi.Controllers;

[ApiController]
[Route("api/v1/customers")]
[AllowAnonymous]
public class CustomerController(ICustomerService customerService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of customers with optional filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CustomerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? riskLevel = null,
        [FromQuery] string? search = null)
    {
        var result = await customerService.GetCustomersAsync(page, pageSize, riskLevel, search);
        return Ok(result);
    }

    /// <summary>
    /// Get customer details with review history statistics.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CustomerDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCustomerById(Guid id)
    {
        var customer = await customerService.GetCustomerByIdAsync(id);
        if (customer == null) return NotFound(new { detail = "Customer not found." });
        return Ok(customer);
    }

    /// <summary>
    /// Manually update customer risk level.
    /// </summary>
    [HttpPut("{id:guid}/risk-level")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRiskLevel(Guid id, [FromBody] UpdateRiskLevelRequest request)
    {
        var customer = await customerService.UpdateRiskLevelAsync(id, request.RiskLevel);
        if (customer == null) return NotFound(new { detail = "Customer not found." });
        return Ok(customer);
    }
}


