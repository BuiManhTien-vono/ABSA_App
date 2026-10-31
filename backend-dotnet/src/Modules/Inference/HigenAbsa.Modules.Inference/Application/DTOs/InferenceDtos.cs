using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Modules.Inference.Application.DTOs;

public class AbsaOptions
{
    public const string SectionName = "Absa";
    public string ModelDir { get; set; } = "../../../ai-service/models/visobert_absa_v8";
    public string Device { get; set; } = "cpu";
    public int BatchSize { get; set; } = 1;
    public bool NoDomainOverrides { get; set; } = false;
}

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

