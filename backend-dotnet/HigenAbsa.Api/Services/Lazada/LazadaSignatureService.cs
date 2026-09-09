// Services/Lazada/LazadaSignatureService.cs - Implementation of Lazada Open Platform HMAC-SHA256 signer
using System.Security.Cryptography;
using System.Text;

namespace HigenAbsa.Api.Services.Lazada;

public class LazadaSignatureService : ILazadaSignatureService
{
    public string GenerateSign(string apiPath, IDictionary<string, string> parameters, string appSecret)
    {
        ArgumentNullException.ThrowIfNull(parameters);
        ArgumentException.ThrowIfNullOrWhiteSpace(appSecret);

        // 1. Sort all parameters alphabetically by key (case-sensitive ASCII sort)
        var sortedParams = parameters
            .Where(kvp => kvp.Key != "sign" && !string.IsNullOrEmpty(kvp.Value))
            .OrderBy(kvp => kvp.Key, StringComparer.Ordinal)
            .ToList();

        // 2. Concatenate apiPath + key1 + val1 + key2 + val2 ...
        var sb = new StringBuilder();
        if (!string.IsNullOrEmpty(apiPath))
        {
            sb.Append(apiPath);
        }

        foreach (var (key, val) in sortedParams)
        {
            sb.Append(key).Append(val);
        }

        string stringToSign = sb.ToString();

        // 3. Compute HMAC-SHA256 hash using appSecret
        byte[] keyBytes = Encoding.UTF8.GetBytes(appSecret);
        byte[] inputBytes = Encoding.UTF8.GetBytes(stringToSign);

        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(inputBytes);

        // 4. Convert hash to uppercase Hex string
        return Convert.ToHexString(hashBytes);
    }
}
