using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Seedbox;
using SeedboxSync.Core.Transfers;

namespace SeedboxSync.Service.Endpoints;

/// <summary>A seedbox entry plus the ids of the media servers that already hold it (files only).</summary>
public sealed record SeedboxEntryDto(string Path, bool Dir, long Size, DateTime? Modified, IReadOnlyList<string> Servers);

public sealed record SeedboxListingDto(
    bool Configured,
    bool Connected,
    bool Refreshing,
    string? Error,
    string MediaRoot,
    string Protocol,
    string Host,
    DateTime? RefreshedUtc,
    long? TotalBytes,
    long? FreeBytes,
    /// <summary>Quota override from Settings, in bytes. Takes precedence over TotalBytes.</summary>
    long? QuotaBytes,
    IReadOnlyList<SeedboxEntryDto> Entries);

public sealed record PathsRequest(List<string> Paths);

public sealed record DownloadRequest(List<string> Paths, List<string>? Servers);

public sealed record DownloadServerResult(string ServerId, string ServerName, int Files, long Bytes, int AlreadyThere, int AlreadyQueued);

public sealed record DeleteResult(int Deleted, long FreedBytes, int Files, int OnlyCopy, int CancelledTransfers);

public static class SeedboxEndpoints
{
    public static void MapSeedboxEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/seedbox", (SeedboxCatalog catalog, SettingsStore settings, MediaServerRegistry servers, InventoryService inventory, CancellationToken ct) =>
            BuildListingAsync(catalog, settings, servers, inventory, ct));

        api.MapPost("/seedbox/refresh", async (SeedboxCatalog catalog, SettingsStore settings, MediaServerRegistry servers, InventoryService inventory, CancellationToken ct) =>
        {
            if (!settings.Current.Seedbox.IsConfigured)
                throw new UserFacingException("Connect a seedbox first: enter the host and media root on the Settings tab.");
            await catalog.RefreshAsync(ct);
            return await BuildListingAsync(catalog, settings, servers, inventory, ct);
        });

        api.MapPost("/seedbox/download", async (DownloadRequest req, SeedboxCatalog catalog, MediaServerRegistry servers, InventoryService inventory, TransferQueue transfers, CancellationToken ct) =>
        {
            var paths = (req.Paths ?? new List<string>()).Select(RelPath.Normalize).ToList();
            if (paths.Count == 0) throw new UserFacingException("Select files or folders to download.");
            var targetIds = req.Servers is { Count: > 0 } ? req.Servers : new List<string> { MediaServerRegistry.LocalId };
            var files = catalog.FilesUnder(paths);
            var results = new List<DownloadServerResult>();
            foreach (var id in targetIds.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                var server = servers.Get(id);
                if (string.IsNullOrWhiteSpace(server.LibraryRoot))
                    throw new UserFacingException($"Set a library folder for {server.Name} on the Servers tab first.");
                var snap = await inventory.GetOrLastKnownAsync(id, ct);
                var missing = files.Where(f => !InventoryService.Has(snap, f.Path, f.Size)).ToList();
                var r = transfers.Enqueue(id, missing);
                results.Add(new DownloadServerResult(id, server.Name, r.Files, r.Bytes, files.Count - missing.Count, r.Skipped));
            }
            return results;
        });

        api.MapPost("/seedbox/delete", async (PathsRequest req, SeedboxCatalog catalog, MediaServerRegistry servers, InventoryService inventory, TransferQueue transfers, CancellationToken ct) =>
        {
            var paths = (req.Paths ?? new List<string>()).Select(RelPath.Normalize).ToList();
            var files = catalog.FilesUnder(paths);
            var snaps = new List<InventoryService.Snapshot>();
            foreach (var s in servers.All)
            {
                try { snaps.Add(await inventory.GetOrLastKnownAsync(s.Id, ct)); }
                catch (UserFacingException) { /* No library folder yet. */ }
            }
            var onlyCopy = files.Count(f => !snaps.Any(sn => InventoryService.Has(sn, f.Path, f.Size)));
            var cancelled = transfers.CancelUnder(paths);
            var deleted = await catalog.DeleteAsync(paths, ct);
            return new DeleteResult(deleted.Count, files.Sum(f => f.Size), files.Count, onlyCopy, cancelled);
        });
    }

    private static async Task<SeedboxListingDto> BuildListingAsync(SeedboxCatalog catalog, SettingsStore settings, MediaServerRegistry servers, InventoryService inventory, CancellationToken ct)
    {
        var s = settings.Current.Seedbox;
        var status = catalog.Status;
        var state = catalog.State;
        var snaps = new List<(string Id, InventoryService.Snapshot Snap)>();
        foreach (var srv in servers.All)
        {
            try { snaps.Add((srv.Id, await inventory.GetOrLastKnownAsync(srv.Id, ct))); }
            catch (UserFacingException) { /* No library folder yet. */ }
        }

        var entries = state.Entries.Select(e => new SeedboxEntryDto(
            e.Path,
            e.IsDirectory,
            e.Size,
            e.ModifiedUtc,
            e.IsDirectory
                ? Array.Empty<string>()
                : snaps.Where(x => InventoryService.Has(x.Snap, e.Path, e.Size)).Select(x => x.Id).ToList())).ToList();

        return new SeedboxListingDto(
            status.Configured,
            status.Connected,
            status.Refreshing,
            status.Error,
            s.MediaRoot,
            s.Protocol.ToString().ToUpperInvariant(),
            s.Host,
            state.RefreshedUtc,
            state.TotalBytes,
            state.FreeBytes,
            s.QuotaTb is { } tb and > 0 ? (long)(tb * 1_000_000_000_000) : null,
            entries);
    }
}
