using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Peers;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Service.Endpoints;

/// <summary>
/// The peer API: this PC's own library, offered to the PCs that added it. Served only on the LAN
/// port, over HTTPS. Everything except /hello and /pair needs a paired PC's key
/// (see <see cref="PeerGuardMiddleware"/>). Each call maps one-to-one onto <see cref="IMediaNode"/>.
/// </summary>
public static class PeerEndpoints
{
    public static void MapPeerEndpoints(this IEndpointRouteBuilder app)
    {
        var peer = app.MapGroup(PeerProtocol.ApiPrefix);

        peer.MapGet("/hello", (InstanceIdentity id, MediaServerRegistry reg) =>
            new PeerHello(id.Id, reg.Local.Name, ServiceInfo.Version));

        peer.MapPost("/pair", (PairRequest req, HttpContext http, PairingService pairing, InstanceIdentity id, MediaServerRegistry reg) =>
        {
            var key = pairing.Pair(req, http.Connection.RemoteIpAddress?.ToString());
            var local = reg.Local;
            return new PairResponse(key, id.Id, local.Name, local.LibraryRoot, ServiceInfo.Version);
        });

        // The PC that added this one removed it again.
        peer.MapDelete("/pair", (HttpContext http, PairingService pairing) =>
        {
            pairing.Remove(PeerGuardMiddleware.PeerId(http));
            return Results.NoContent();
        });

        peer.MapGet("/status", async (InstanceIdentity id, MediaServerRegistry reg, CancellationToken ct) =>
            new PeerInfo(id.Id, reg.Local.Name, ServiceInfo.Version, await Node(reg).GetStatusAsync(ct)));

        peer.MapGet("/files", (MediaServerRegistry reg, CancellationToken ct) => Node(reg).ScanAsync(ct));

        peer.MapGet("/file", async (string path, MediaServerRegistry reg, CancellationToken ct) =>
            await Node(reg).GetFileAsync(RelPath.Normalize(path), ct) is { } f ? Results.Ok(f) : Results.NotFound());

        peer.MapGet("/stream", async (string path, MediaServerRegistry reg, CancellationToken ct) =>
        {
            var rel = RelPath.Normalize(path);
            var stream = await Node(reg).OpenReadAsync(rel, ct);
            return Results.File(stream, "application/octet-stream", enableRangeProcessing: true);
        });

        peer.MapPut("/file", async (string path, HttpRequest request, MediaServerRegistry reg, CancellationToken ct) =>
        {
            // Sidecars only: artwork, .nfo and subtitles.
            if (request.ContentLength > 64 * 1024 * 1024) throw new UserFacingException("File too large.", 413);
            await Node(reg).WriteFileAsync(RelPath.Normalize(path), request.Body, ct);
            return Results.NoContent();
        });

        peer.MapPost("/download", DownloadAsync);

        peer.MapDelete("/partial", async (string path, MediaServerRegistry reg, CancellationToken ct) =>
        {
            await Node(reg).DiscardPartialAsync(RelPath.Normalize(path), ct);
            return Results.NoContent();
        });

        peer.MapGet("/tags", async (string path, MediaServerRegistry reg, CancellationToken ct) =>
            await Node(reg).ReadTagsAsync(RelPath.Normalize(path), ct) is { } t ? Results.Ok(t) : Results.NoContent());

        peer.MapPost("/open", async (string path, MediaServerRegistry reg, CancellationToken ct) =>
        {
            await Node(reg).OpenWithDefaultPlayerAsync(RelPath.Normalize(path), ct);
            return Results.NoContent();
        });

        peer.MapPut("/libraryroot", (LibraryRootRequest req, MediaServerRegistry reg, InventoryService inventory) =>
        {
            var id = reg.Local.Id;
            reg.SetLibraryRoot(id, req.Root);
            _ = Task.Run(() => inventory.ScanAsync(id, CancellationToken.None));
            return Results.NoContent();
        });
    }

    private static IMediaNode Node(MediaServerRegistry reg) => reg.GetNode(reg.Local.Id);

    /// <summary>
    /// Downloads one file from the seedbox onto this PC, streaming newline-delimited JSON progress
    /// to the caller. If the caller disconnects, the download stops and the partial file stays for
    /// a later resume.
    /// </summary>
    private static async Task DownloadAsync(HttpContext http, NodeDownloadRequest req, MediaServerRegistry reg, ILoggerFactory logs)
    {
        var log = logs.CreateLogger("SeedboxSync.Peer");
        var ct = http.RequestAborted;
        var res = http.Response;
        res.ContentType = "application/x-ndjson";
        res.Headers.CacheControl = "no-store";
        await res.StartAsync(ct);

        var gate = new SemaphoreSlim(1, 1);
        async Task WriteAsync(DownloadProgress p)
        {
            await gate.WaitAsync(CancellationToken.None);
            try
            {
                await JsonSerializer.SerializeAsync(res.Body, p, PeerProtocol.Json, ct);
                await res.Body.WriteAsync("\n"u8.ToArray(), ct);
                await res.Body.FlushAsync(ct);
            }
            finally
            {
                gate.Release();
            }
        }

        long position = 0;
        using var done = new CancellationTokenSource();
        // Progress every half second when it moves, and a heartbeat every 10 seconds regardless,
        // so the caller can tell a slow seedbox from a dead connection.
        var ticker = Task.Run(async () =>
        {
            long last = -1;
            var quiet = 0;
            try
            {
                while (true)
                {
                    await Task.Delay(500, done.Token);
                    var p = Interlocked.Read(ref position);
                    if (p != last || ++quiet >= 20)
                    {
                        last = p;
                        quiet = 0;
                        await WriteAsync(new DownloadProgress(p, false, null, null, false));
                    }
                }
            }
            catch (OperationCanceledException) { }
            catch (IOException) { }
        });

        DownloadProgress final;
        try
        {
            var file = await Node(reg).DownloadFromSeedboxAsync(req, p => Interlocked.Exchange(ref position, p), ct);
            final = new DownloadProgress(file.Size, true, file, null, false);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            done.Cancel();
            await ticker;
            return;
        }
        catch (Exception ex)
        {
            log.LogWarning(ex, "Download of {Path} for another PC failed", req.RelativePath);
            final = new DownloadProgress(null, false, null,
                ex is UserFacingException ? ex.Message : SeedboxCatalog.Describe(ex, req.Seedbox.Host, req.Seedbox.Port),
                ex is not UserFacingException);
        }
        done.Cancel();
        await ticker;
        try { await WriteAsync(final); }
        catch (Exception ex) when (ex is IOException or OperationCanceledException) { /* Caller went away. */ }
    }
}
