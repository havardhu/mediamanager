using System.Security.Cryptography;
using System.Text;

namespace SeedboxSync.Core.Configuration;

/// <summary>
/// Encrypts passwords and API keys at rest with Windows DPAPI (machine scope), so settings.json
/// can be read by the service account and by an administrator running the app in a console,
/// but is useless when copied to another PC. On other platforms values are only base64-encoded.
/// </summary>
public static class SecretProtector
{
    private const string DpapiPrefix = "dpapi:";
    private const string PlainPrefix = "b64:";
    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("SeedboxSync.v1");

    public static string Protect(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        var bytes = Encoding.UTF8.GetBytes(value);
        if (OperatingSystem.IsWindows())
        {
            var enc = ProtectedData.Protect(bytes, Entropy, DataProtectionScope.LocalMachine);
            return DpapiPrefix + Convert.ToBase64String(enc);
        }
        return PlainPrefix + Convert.ToBase64String(bytes);
    }

    public static string Unprotect(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        try
        {
            if (value.StartsWith(DpapiPrefix, StringComparison.Ordinal))
            {
                if (!OperatingSystem.IsWindows()) return string.Empty;
                var raw = Convert.FromBase64String(value[DpapiPrefix.Length..]);
                return Encoding.UTF8.GetString(ProtectedData.Unprotect(raw, Entropy, DataProtectionScope.LocalMachine));
            }
            if (value.StartsWith(PlainPrefix, StringComparison.Ordinal))
                return Encoding.UTF8.GetString(Convert.FromBase64String(value[PlainPrefix.Length..]));
        }
        catch (CryptographicException)
        {
            return string.Empty;
        }
        catch (FormatException)
        {
            return string.Empty;
        }
        // Hand-edited settings may contain the plain value.
        return value;
    }
}
