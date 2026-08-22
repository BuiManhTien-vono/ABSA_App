// Controllers/ResponseController.cs - Response Template, Automation Rule & Review Response Endpoints
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HigenAbsa.Api.Models.Response;
using HigenAbsa.Api.Models.Review;
using HigenAbsa.Api.Services.Response;

namespace HigenAbsa.Api.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class ResponseController(IResponseService responseService) : ControllerBase
{
    // -----------------------------------------------------------------------
    // Response Templates
    // -----------------------------------------------------------------------

    /// <summary>
    /// Get paginated list of response templates.
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(List<ResponseTemplateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null)
    {
        var result = await responseService.GetTemplatesAsync(page, pageSize, storeId);
        return Ok(result);
    }

    /// <summary>
    /// Create a new response template.
    /// </summary>
    [HttpPost("templates")]
    [ProducesResponseType(typeof(ResponseTemplateDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateTemplateRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var template = await responseService.CreateTemplateAsync(request, userId.Value);
        return Created($"/api/v1/templates/{template.Id}", template);
    }

    /// <summary>
    /// Update an existing response template.
    /// </summary>
    [HttpPut("templates/{id:guid}")]
    [ProducesResponseType(typeof(ResponseTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateTemplateRequest request)
    {
        var template = await responseService.UpdateTemplateAsync(id, request);
        if (template == null) return NotFound(new { detail = "Template not found." });
        return Ok(template);
    }

    /// <summary>
    /// Delete a response template.
    /// </summary>
    [HttpDelete("templates/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        var success = await responseService.DeleteTemplateAsync(id);
        if (!success) return NotFound(new { detail = "Template not found." });
        return Ok(new { message = "Template deleted successfully." });
    }

    // -----------------------------------------------------------------------
    // Automation Rules
    // -----------------------------------------------------------------------

    /// <summary>
    /// Get paginated list of automation rules.
    /// </summary>
    [HttpGet("automation-rules")]
    [ProducesResponseType(typeof(List<AutomationRuleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRules(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null)
    {
        var result = await responseService.GetRulesAsync(page, pageSize, storeId);
        return Ok(result);
    }

    /// <summary>
    /// Create a new automation rule.
    /// </summary>
    [HttpPost("automation-rules")]
    [ProducesResponseType(typeof(AutomationRuleDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateRule([FromBody] CreateRuleRequest request)
    {
        var rule = await responseService.CreateRuleAsync(request);
        return Created($"/api/v1/automation-rules/{rule.Id}", rule);
    }

    /// <summary>
    /// Update an existing automation rule.
    /// </summary>
    [HttpPut("automation-rules/{id:guid}")]
    [ProducesResponseType(typeof(AutomationRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] UpdateRuleRequest request)
    {
        var rule = await responseService.UpdateRuleAsync(id, request);
        if (rule == null) return NotFound(new { detail = "Automation rule not found." });
        return Ok(rule);
    }

    /// <summary>
    /// Toggle an automation rule on/off.
    /// </summary>
    [HttpPut("automation-rules/{id:guid}/toggle")]
    [ProducesResponseType(typeof(AutomationRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleRule(Guid id)
    {
        var rule = await responseService.ToggleRuleAsync(id);
        if (rule == null) return NotFound(new { detail = "Automation rule not found." });
        return Ok(rule);
    }

    // -----------------------------------------------------------------------
    // Review Responses
    // -----------------------------------------------------------------------

    /// <summary>
    /// Send a manual response to a review.
    /// </summary>
    [HttpPost("reviews/{reviewId:guid}/respond")]
    [ProducesResponseType(typeof(ReviewResponseItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendResponse(Guid reviewId, [FromBody] SendResponseRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var response = await responseService.SendManualResponseAsync(reviewId, request, userId.Value);
            return Created($"/api/v1/reviews/{reviewId}/responses", response);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { detail = ex.Message });
        }
    }

    /// <summary>
    /// Get response history for a review.
    /// </summary>
    [HttpGet("reviews/{reviewId:guid}/responses")]
    [ProducesResponseType(typeof(List<ReviewResponseItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResponseHistory(Guid reviewId)
    {
        var history = await responseService.GetResponseHistoryAsync(reviewId);
        return Ok(history);
    }

    // -----------------------------------------------------------------------

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return claim != null && Guid.TryParse(claim, out var id) ? id : null;
    }
}
