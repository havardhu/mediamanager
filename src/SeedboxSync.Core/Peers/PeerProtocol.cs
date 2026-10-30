using System.Net;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Core.Peers;

/// <summary>
/// How two Seedbox Sync installs on the same network find and talk to each other. Every install
/// is the same program: it announces itself with a UDP multicast beacon, and serves the peer API
/// (its own library, as an <see cref="IMediaNode"/>) over HTTPS on the LAN port. The web UI and its
/// API stay on 127.0.0.1.
/// </summary>
public static class PeerProtocol
{
    public const string AppName = "SeedboxSync";
    public const int Version = 1;
    public const string ApiPrefix = "/peer/v1";
    public const string PeerIdHeader = "X-SeedboxSync-Peer";
    public const int DefaultPort = 8743;
    public const int DefaultDiscoveryPort = 8744;

    /// <summary>Administratively scoped multicast group (239/8), so beacons never leave the LAN.</summary>
    public static readonly IPAddress MulticastGroup = IPAddress.Parse("239.255.87.44");

    /// <summary>Same JSON shape as the HTTP API: camelCase, enums as camelCase strings.</summary>
    public static readonly JsonSerializerOptions Json = CreateJson();

    private static JsonSerializerOptions CreateJson()
    {
        var o = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        o.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return o;
    }

    /// <summary>SHA-256 of the certificate, as upper-case hex. Pinned by the PC that adds this one.</summary>
    public static string Thumbprint(X509Certificate cert) => Convert.ToHexString(SHA256.HashData(cert.GetRawCertData()));

    /// <summary>"k7q 4xm" → "K7Q4XM".</summary>
    public static string NormalizeCode(string? code) =>
        new((code ?? string.Empty).Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());

    /// <summary>
    /// Proof that the caller knows the pairing code, bound to the certificate it actually connected
    /// to. The code itself never crosses the network, and a machine in the middle presenting its own
    /// certificate cannot produce a proof the real PC accepts.
    /// </summary>
    public static string PairingProof(string code, string thumbprint, string managerId)
    {
        var key = Encoding.UTF8.GetBytes(NormalizeCode(code));
        var msg = Encoding.UTF8.GetBytes($"{thumbprint.ToUpperInvariant()}|{managerId}");
        return Convert.ToHexString(HMACSHA256.HashData(key, msg));
    }

    public static bool FixedTimeEquals(string a, string b)
    {
        var x = Encoding.UTF8.GetBytes(a);
        var y = Encoding.UTF8.GetBytes(b);
        return x.Length == y.Length && CryptographicOperations.FixedTimeEquals(x, y);
    }

    /// <summary>
    /// Accepts "192.168.1.31", "192.168.1.31:8743", "office-pc" or "https://192.168.1.31:8743"
    /// and returns "https://host:port".
    /// </summary>
    public static string NormalizeAddress(string? input, int defaultPort = DefaultPort)
    {
        var s = (input ?? string.Empty).Trim().TrimEnd('/');
        if (s.Length == 0) throw new Common.UserFacingException("Enter the other PC's address, such as 192.168.1.31.");
        if (!s.Contains("://", StringComparison.Ordinal)) s = "https://" + s;
        if (!Uri.TryCreate(s, UriKind.Absolute, out var uri) || string.IsNullOrEmpty(uri.Host))
            throw new Common.UserFacingException($"'{input}' is not a valid address. Use an IP address or PC name, such as 192.168.1.31.");
        var port = uri.IsDefaultPort && !s.Contains(":" + uri.Port, StringComparison.Ordinal) ? defaultPort : uri.Port;
        var host = uri.HostNameType == UriHostNameType.IPv6 ? $"[{uri.DnsSafeHost}]" : uri.DnsSafeHost;
        return $"https://{host}:{port}";
    }
}

/// <summary>Multicast announcement. Sent every few seconds; <c>Query</c> asks everyone to answer now.</summary>
public sealed record PeerBeacon(string App, int V, string Id, string Name, int Port, string Version, bool Query = false);

public sealed record PairRequest(string ManagerId, string ManagerName, string Proof);

public sealed record PairResponse(string Key, string InstanceId, string Name, string LibraryRoot, string Version);

public sealed record PeerInfo(string InstanceId, string Name, string Version, NodeStatus Status);

public sealed record LibraryRootRequest(string Root);

/// <summary>One line of the newline-delimited JSON stream returned by the download call.</summary>
public sealed record DownloadProgress(long? Position, bool Done, NodeFile? File, string? Error, bool Retryable);

/// <summary>Network settings from appsettings.json.</summary>
public sealed class PeerOptions
{
    /// <summary>False when the "Peer" endpoint is removed from appsettings.json: no LAN, no discovery.</summary>
    public bool Enabled { get; init; }
    public int Port { get; init; } = PeerProtocol.DefaultPort;
    public int DiscoveryPort { get; init; } = PeerProtocol.DefaultDiscoveryPort;
}
