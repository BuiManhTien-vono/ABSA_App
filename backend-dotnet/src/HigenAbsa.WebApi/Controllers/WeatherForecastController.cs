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
using Microsoft.AspNetCore.Mvc;

namespace HigenAbsa.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries =
    [
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    ];

    [HttpGet(Name = "GetWeatherForecast")]
    public IEnumerable<WeatherForecast> Get()
    {
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray();
    }
}

