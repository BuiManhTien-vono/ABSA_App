// Application/Common/AbsaOptions.cs - ABSA Config options
namespace HigenAbsa.Application.Common;

public class AbsaOptions
{
    public const string SectionName = "Absa";
    public string ModelDir { get; set; } = "models/visobert_absa_v8";
    public string Device { get; set; } = "cpu";
    public int BatchSize { get; set; } = 16;
    public bool NoDomainOverrides { get; set; } = false;
}
