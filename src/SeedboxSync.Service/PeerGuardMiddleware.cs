using SeedboxSync.Core.Peers;

namespace SeedboxSync.Service;

/// <summary>
/// Keeps the two faces of the service apart. The web UI and its API answer only on the local
/// port (127.0.0.1), as before, and trust whoever can reach them. The peer API answers only on
/// the LAN port, and every call except /hello and /pair must carry a paired PC's ID and key.
/// </summary>
public sealed class PeerGuardMiddleware
{
    private const string PeerIdItem = "SeedboxSync.PeerId";
    private readonly RequestDelegate _next;
    private readonly PeerOptions _options;
    private readonly PairingService _pairing;

    public PeerGuardMiddleware(RequestDelegate next, PeerOptions options, PairingService pairing)
    {
        _next = next;
        _options = options;
        _pairing = pairing;
    }

    public static string PeerId(HttpContext http) => http.Items[PeerIdItem] as string ?? string.Empty;

    public async Task InvokeAsync(HttpContext context)
    {
        var onPeerPort = _options.Enabled && context.Connection.LocalPort == _options.Port;
        var peerPath = context.Request.Path.StartsWithSegments(PeerProtocol.ApiPrefix, out var rest);
        if (onPeerPort != peerPath)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }
        if (peerPath)
        {
            var sub = rest.Value ?? string.Empty;
            var open = (string.Equals(sub, "/hello", StringComparison.OrdinalIgnoreCase) && HttpMethods.IsGet(context.Request.Method))
                || (string.Equals(sub, "/pair", StringComparison.OrdinalIgnoreCase) && HttpMethods.IsPost(context.Request.Method));
            if (!open)
            {
                var id = context.Request.Headers[PeerProtocol.PeerIdHeader].ToString();
                var auth = context.Request.Headers.Authorization.ToString();
                var key = auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? auth[7..].Trim() : string.Empty;
                if (!_pairing.Authenticate(id, key, context.Connection.RemoteIpAddress?.ToString()))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "This PC is not paired with that one. Add it again with a new pairing code." });
                    return;
                }
                context.Items[PeerIdItem] = id;
            }
        }
        await _next(context);
    }
}
