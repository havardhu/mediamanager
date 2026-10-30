using System.Net.Http.Json;
using System.Net.Security;
using System.Security.Authentication;
using System.Text.Json;
using SeedboxSync.Core.Common;

namespace SeedboxSync.Core.Peers;

public sealed record PeerHello(string InstanceId, string Name, string Version);

/// <summary>
/// The adding side of pairing. Connects to the other PC, notes the certificate it presents,
/// and sends a proof made from the pairing code and that certificate. On success the other PC
/// returns a key, and the certificate's thumbprint is pinned for every later call.
/// </summary>
public static class PeerPairingClient
{
    public static async Task<(PairResponse Response, string Thumbprint)> PairAsync(
        string address, string code, string managerId, string managerName, CancellationToken ct)
    {
        if (PeerProtocol.NormalizeCode(code).Length != 6)
            throw new UserFacingException("Enter the 6-character pairing code shown on the other PC.");

        string? seen = null;
        var changed = false;
        using var http = new HttpClient(new SocketsHttpHandler
        {
            ConnectTimeout = TimeSpan.FromSeconds(5),
            SslOptions = new SslClientAuthenticationOptions
            {
                // Trust on first use; the pairing proof below is what makes it safe.
                RemoteCertificateValidationCallback = (_, cert, _, _) =>
                {
                    if (cert == null) return false;
                    var t = PeerProtocol.Thumbprint(cert);
                    if (seen != null && seen != t) changed = true;
                    seen = t;
                    return !changed;
                },
            },
        })
        {
            BaseAddress = new Uri(address + PeerProtocol.ApiPrefix + "/"),
            Timeout = TimeSpan.FromSeconds(20),
        };

        try
        {
            using var hello = await http.GetAsync("hello", ct);
            await EnsureOkAsync(hello, address, ct);
            if (seen == null) throw new UserFacingException($"{address} did not present a certificate.");
            var proof = PeerProtocol.PairingProof(code, seen, managerId);
            using var res = await http.PostAsJsonAsync("pair", new PairRequest(managerId, managerName, proof), PeerProtocol.Json, ct);
            await EnsureOkAsync(res, address, ct);
            var body = await res.Content.ReadFromJsonAsync<PairResponse>(PeerProtocol.Json, ct)
                ?? throw new UserFacingException($"{address} gave an empty answer.");
            return (body, seen);
        }
        catch (TaskCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new UserFacingException($"{address} did not answer in time.");
        }
        catch (Exception ex) when (ex is HttpRequestException or AuthenticationException or IOException)
        {
            throw new UserFacingException(
                $"Could not reach Seedbox Sync at {address}. Check the address, that Seedbox Sync is running on that PC, and that its firewall allows TCP port {new Uri(address).Port}.", 502, ex);
        }
    }

    private static async Task EnsureOkAsync(HttpResponseMessage res, string address, CancellationToken ct)
    {
        if (res.IsSuccessStatusCode) return;
        string? message = null;
        try
        {
            var body = await res.Content.ReadFromJsonAsync<JsonElement>(PeerProtocol.Json, ct);
            if (body.ValueKind == JsonValueKind.Object && body.TryGetProperty("message", out var m)) message = m.GetString();
        }
        catch (Exception ex) when (ex is JsonException or NotSupportedException) { }
        if (res.StatusCode == System.Net.HttpStatusCode.NotFound && message == null)
            throw new UserFacingException($"{address} answered, but it is not Seedbox Sync (or an older version without LAN support).");
        throw new UserFacingException(message ?? $"{address} refused the request ({(int)res.StatusCode}).");
    }
}
