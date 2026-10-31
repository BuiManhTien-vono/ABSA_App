using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.Modules.Engagement.Application.Services;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.Engagement.Endpoints;

[ApiController]
[Route("api/v1/tickets")]
[AllowAnonymous]
public class TicketController(ITicketService ticketService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TicketListDto>), StatusCodes.Status200OK)]
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

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTicketById(Guid id)
    {
        var ticket = await ticketService.GetTicketByIdAsync(id);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

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

    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTicketStatus(Guid id, [FromBody] UpdateTicketStatusRequest request)
    {
        var ticket = await ticketService.UpdateTicketStatusAsync(id, request.Status);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

    [HttpPut("{id:guid}/resolve")]
    [ProducesResponseType(typeof(TicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolveTicket(Guid id, [FromBody] ResolveTicketRequest request)
    {
        var ticket = await ticketService.ResolveTicketAsync(id, request.ResolutionNotes);
        if (ticket == null) return NotFound(new { detail = "Ticket not found." });
        return Ok(ticket);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(TicketStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTicketStats()
    {
        var stats = await ticketService.GetTicketStatsAsync();
        return Ok(stats);
    }
}

