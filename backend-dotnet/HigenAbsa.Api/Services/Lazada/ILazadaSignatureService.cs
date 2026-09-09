// Services/Lazada/ILazadaSignatureService.cs - Interface for Lazada API signature computation
namespace HigenAbsa.Api.Services.Lazada;

public interface ILazadaSignatureService
{
    /// <summary>
    /// Computes the HMAC-SHA256 request signature according to Lazada Open Platform specification.
    /// </summary>
    /// <param name="apiPath">The API path (e.g. "/auth/token/create" or "/review/seller/list")</param>
    /// <param name="parameters">All system and business request parameters excluding "sign"</param>
    /// <param name="appSecret">Lazada App Secret key</param>
    /// <returns>Uppercase hex string of the HMAC-SHA256 signature</returns>
    string GenerateSign(string apiPath, IDictionary<string, string> parameters, string appSecret);
}
