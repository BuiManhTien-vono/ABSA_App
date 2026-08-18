// Models/Requests.cs - API request/response models
using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Api.Models;

public class PredictRequest
{
    [Required, MinLength(1)]
    public string Text { get; set; } = "";

    public bool? NoDomainOverrides { get; set; }
}

public class BatchPredictRequest
{
    [Required, MinLength(1)]
    public List<string> Texts { get; set; } = [];

    public bool? NoDomainOverrides { get; set; }
}
