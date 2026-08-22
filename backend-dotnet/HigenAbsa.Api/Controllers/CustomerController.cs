// Controllers/CustomerController.cs - Customer Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Customer;
using HigenAbsa.Api.Services.Customer;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/customers")]
[Authorize]
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
