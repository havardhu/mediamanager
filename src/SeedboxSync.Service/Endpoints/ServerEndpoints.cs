using SeedboxSync.Core.Common;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Peers;
using SeedboxSync.Core.Transfers;

namespace SeedboxSync.Service.Endpoints;

public sealed record ServerDto(
    string Id,
    string Name,
    MediaServerKind Kind,
    string LibraryRoot,
    string? Address,
    NodeStatus Status);

public sealed record UpdateServerRequest(string? Name, string? LibraryRoot);

public sealed record PairServerRequest(string Address, string Code);

public static class ServerEndpoints
{
    public static void MapServerEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/servers", async (MediaServerRegistry registry, CancellationToken ct) =>
        {
            // Remote PCs are asked in parallel, so one that is off does not hold up the rest.
            var all = registry.All;
            var dtos = await Task.WhenAll(all.Select(s => ToDtoAsync(registry, s, ct)));
            return dtos.ToList();
        });

        api.MapPut("/servers/{id}", async (string id, UpdateServerRequest req, MediaServerRegistry registry, InventoryService inventory, CancellationToken ct) =>
        {
            if (req.Name != null) registry.Rename(id, req.Name);
            if (req.LibraryRoot != null)
            {
                // A remote PC's library folder is its own setting; change it there first.
                if (registry.GetNode(id) is RemoteMediaNode remote) await remote.SetLibraryRootAsync(req.LibraryRoot.Trim(), ct);
                registry.SetLibraryRoot(id, req.LibraryRoot);
                _ = Task.Run(() => inventory.ScanAsync(id, CancellationToken.None));
            }
            return await ToDtoAsync(registry, registry.Get(id), ct);
        });

        api.MapDelete("/servers/{id}", async (string id, MediaServerRegistry registry, TransferQueue transfers, CancellationToken ct) =>
        {
            var server = registry.Get(id);
            if (server.Kind == MediaServerKind.Local) throw new UserFacingException("This PC runs the Seedbox Sync service. It cannot be removed.");
            foreach (var t in transfers.Snapshot().Where(x => x.ServerId == id)) transfers.Cancel(t.Id);
            if (registry.GetNode(id) is RemoteMediaNode remote) await remote.UnpairAsync(ct);
            registry.Remove(id);
            return Results.NoContent();
        });

        // Other installs heard on the LAN that are not added yet.
        api.MapGet("/servers/discovered", (DiscoveryService discovery, MediaServerRegistry registry) =>
        {
            var added = registry.All.Where(s => s.Kind == MediaServerKind.Remote).Select(s => s.InstanceId).ToHashSet();
            return new { enabled = discovery.Enabled, peers = discovery.Peers.Where(p => !added.Contains(p.InstanceId)).ToList() };
        });

        api.MapPost("/servers/discover", (DiscoveryService discovery) =>
        {
            discovery.Query();
            return Results.NoContent();
        });

        // Add another PC: it shows a pairing code, the user types it here.
        api.MapPost("/servers/pair", async (PairServerRequest req, MediaServerRegistry registry, InstanceIdentity identity, PeerOptions options,
            InventoryService inventory, LibraryService library, ILoggerFactory logs, CancellationToken ct) =>
        {
            var address = PeerProtocol.NormalizeAddress(req.Address, options.Port);
            var (res, thumbprint) = await PeerPairingClient.PairAsync(address, req.Code, identity.Id, registry.Local.Name, ct);
            var server = registry.AddRemote(res.InstanceId, res.Name, address, res.LibraryRoot, res.Key, thumbprint);
            var log = logs.CreateLogger("SeedboxSync.Pairing");
            log.LogInformation("Paired with {Name} at {Address}", res.Name, address);
            // Read its library in the background, so its titles and sync state appear shortly.
            _ = Task.Run(async () =>
            {
                try { await library.ScanAsync(server.Id, CancellationToken.None); }
                catch (Exception ex) { log.LogWarning(ex, "First scan of {Server} failed", server.Id); }
            });
            return await ToDtoAsync(registry, server, ct);
        });
    }

    /// <summary>This PC as the one being added: pairing code and the PCs that may manage it.</summary>
    public static void MapPairingEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/pairing", (PairingService pairing, PeerOptions options, MediaServerRegistry registry) => new
        {
            enabled = options.Enabled,
            port = options.Port,
            name = registry.Local.Name,
            addresses = DiscoveryService.LocalAddresses().Select(a => a.ToString()).ToList(),
            code = pairing.Current,
            managers = pairing.Managers,
        });

        api.MapPost("/pairing/code", (PairingService pairing, PeerOptions options) =>
        {
            if (!options.Enabled)
                throw new UserFacingException("LAN access is turned off. Add the Peer endpoint back to appsettings.json and restart Seedbox Sync.");
            return pairing.Start();
        });

        api.MapDelete("/pairing/code", (PairingService pairing) =>
        {
            pairing.Cancel();
            return Results.NoContent();
        });

        api.MapDelete("/pairing/managers/{id}", (string id, PairingService pairing) =>
        {
            pairing.Remove(id);
            return Results.NoContent();
        });
    }

    private static async Task<ServerDto> ToDtoAsync(MediaServerRegistry registry, MediaServerConfig s, CancellationToken ct)
    {
        var status = await registry.GetNode(s.Id).GetStatusAsync(ct);
        var root = s.LibraryRoot;
        if (s.Kind == MediaServerKind.Remote && status.Online && !string.IsNullOrEmpty(status.LibraryRoot))
        {
            root = status.LibraryRoot;
            registry.CacheLibraryRoot(s.Id, root);
        }
        return new ServerDto(s.Id, s.Name, s.Kind, root, s.Address, status);
    }
}
