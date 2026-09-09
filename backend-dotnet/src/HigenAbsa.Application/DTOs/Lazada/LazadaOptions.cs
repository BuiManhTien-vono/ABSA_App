// Models/Lazada/LazadaOptions.cs - Lazada Open Platform configuration options
namespace HigenAbsa.Application.DTOs.Lazada;

public class LazadaOptions
{
    public const string SectionName = "Lazada";

    public string AppKey { get; set; } = "YOUR_LAZADA_APP_KEY";
    public string AppSecret { get; set; } = "YOUR_LAZADA_APP_SECRET";
    public string CallbackUrl { get; set; } = "https://localhost:7136/api/lazada/callback";
    public string AuthBaseUrl { get; set; } = "https://auth.lazada.com/rest";
    public string ApiBaseUrl { get; set; } = "https://api.lazada.vn/rest";
}
