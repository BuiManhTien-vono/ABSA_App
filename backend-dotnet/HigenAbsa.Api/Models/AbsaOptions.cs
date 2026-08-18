// Models/AbsaOptions.cs - Config options
namespace HigenAbsa.Api;

public class AbsaOptions
{
    public const string SectionName = "Absa";
    public string ModelDir { get; set; } = "models/visobert_absa_v8";
    public string Device { get; set; } = "cpu";
    public int BatchSize { get; set; } = 16;
    public bool NoDomainOverrides { get; set; } = false;
}
