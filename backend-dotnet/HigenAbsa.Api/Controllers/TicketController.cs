// Controllers/TicketController.cs - Ticket CSKH Management Endpoints
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Ticket;
using HigenAbsa.Api.Services.Ticket;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1/tickets")]
[Authorize]
public class TicketController(ITicketService ticketService) : ControllerBase
{
    /// <summary>
    /// Get paginated list of tickets with optional status, priority, and assignment filters.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<TicketListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTickets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] Guid? assignedToUserId = null)
    {
        var result = await ticketService.GetTicketsAsync(page, pageSize, status, priority, assignedToUserId);
        return Ok(result);
    }

    /// <summary>
    /// Get ticket details by ID including associated review and AI insight information.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTicketById(Guid id)
    {
        var ticket = await ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

    /// <summary>
    /// Assign a ticket to a CSKH staff member.
    /// </summary>
    [HttpPut("{id:guid}/assign")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignTicket(Guid id, [FromBody] AssignTicketRequest request)
    {
        try
        {
            var ticket = await ticketService.AssignTicketAsync(id, request.UserId);
            if (ticket == null) return NotFound(new { detail = "Ticket not found." });
            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    /// <summary>
    /// Update the status of a ticket (OPEN, IN_PROGRESS, RESOLVED, CLOSED).
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTicketStatus(Guid id, [FromBody] UpdateTicketStatusRequest request)
    {
        var ticket = await ticketService.UpdateTicketStatusAsync(id, request.Status);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

    /// <summary>
    /// Resolve a ticket with resolution notes.
    /// </summary>
    [HttpPut("{id:guid}/resolve")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveTicket(Guid id, [FromBody] ResolveTicketRequest request)
    {
        var ticket = await ticketService.ResolveTicketAsync(id, request.ResolutionNotes);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

    /// <summary>
    /// Get aggregated ticket statistics (by status, priority, and assignee).
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(TicketStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTicketStats()
    {
        var stats = await ticketService.GetTicketStatsAsync();
        return Ok(stats);
    }
}
