using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Common;

namespace SeedboxSync.Core.Nodes;

/// <summary>
/// What each media server has on disk, cached in memory. Sync state is "the server has a file at
/// the same relative path with the same size". Scans run at startup, on "Scan library", when a
/// library root changes and when the cache is older than <see cref="MaxAge"/>; finished
/// transfers update it directly.
/// </summary>
public sealed class InventoryService
{
    public static readonly TimeSpan MaxAge = TimeSpan.FromMinutes(10);

    private readonly MediaServerRegistry _registry;
    private readonly ILogger<InventoryService> _log;
    private readonly object _lock = new();
    private readonly Dictionary<string, Snapshot> _snapshots = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, SemaphoreSlim> _scanLocks = new(StringComparer.OrdinalIgnoreCase);

    public InventoryService(MediaServerRegistry registry, ILogger<InventoryService> log)
    {
        _registry = registry;
        _log = log;
        _registry.LibraryRootChanged += id =>
        {
            lock (_lock) _snapshots.Remove(id);
        };
    }

    /// <summary>Raised after a scan or an update, with the server id.</summary>
    public event Action<string>? Changed;

    public sealed class Snapshot
    {
        public Snapshot(IEnumerable<NodeFile> files, DateTime scannedUtc)
        {
            Files = new Dictionary<string, NodeFile>(RelPath.Comparer);
            foreach (var f in files) Files[f.RelativePath] = f;
            ScannedUtc = scannedUtc;
        }

        /// <summary>Treat as read-only; updates replace the whole snapshot.</summary>
        public Dictionary<string, NodeFile> Files { get; }
        public DateTime ScannedUtc { get; }

        public Snapshot With(NodeFile file) => new(Files.Values.Where(f => !RelPath.Comparer.Equals(f.RelativePath, file.RelativePath)).Append(file), ScannedUtc);
    }

    public async Task<Snapshot> GetAsync(string serverId, CancellationToken ct, bool forceRescan = false)
    {
        lock (_lock)
        {
            if (!forceRescan && _snapshots.TryGetValue(serverId, out var s) && DateTime.UtcNow - s.ScannedUtc < MaxAge)
                return s;
        }
        return await ScanAsync(serverId, ct);
    }

    /// <summary>
    /// Like <see cref="GetAsync"/>, but a remote PC that cannot be reached gives its last known
    /// files (or none) instead of an error, so one PC being off does not break the seedbox view.
    /// </summary>
    public async Task<Snapshot> GetOrLastKnownAsync(string serverId, CancellationToken ct)
    {
        try
        {
            return await GetAsync(serverId, ct);
        }
        catch (RemoteNodeException)
        {
            return Peek(serverId) ?? new Snapshot(Array.Empty<NodeFile>(), DateTime.MinValue);
        }
    }

    /// <summary>The cached snapshot, even if stale, or null when the server was never scanned.</summary>
    public Snapshot? Peek(string serverId)
    {
        lock (_lock) return _snapshots.TryGetValue(serverId, out var s) ? s : null;
    }

    public async Task<Snapshot> ScanAsync(string serverId, CancellationToken ct)
    {
        SemaphoreSlim gate;
        lock (_lock)
        {
            if (_scanLocks.TryGetValue(serverId, out var existing)) gate = existing;
            else _scanLocks[serverId] = gate = new SemaphoreSlim(1, 1);
        }
        var started = DateTime.UtcNow;
        await gate.WaitAsync(ct);
        try
        {
            // Another caller may have finished a scan while we waited.
            lock (_lock)
            {
                if (_snapshots.TryGetValue(serverId, out var fresh) && fresh.ScannedUtc >= started) return fresh;
            }
            var node = _registry.GetNode(serverId);
            var files = await node.ScanAsync(ct);
            var snap = new Snapshot(files, DateTime.UtcNow);
            lock (_lock) _snapshots[serverId] = snap;
            _log.LogInformation("Scanned {Server}: {Count} files", serverId, files.Count);
            Changed?.Invoke(serverId);
            return snap;
        }
        finally
        {
            gate.Release();
        }
    }

    public void Upsert(string serverId, NodeFile file)
    {
        lock (_lock)
        {
            if (_snapshots.TryGetValue(serverId, out var s)) _snapshots[serverId] = s.With(file);
        }
        Changed?.Invoke(serverId);
    }

    /// <summary>True when the server holds the seedbox file at the same path with the same size.</summary>
    public static bool Has(Snapshot snapshot, string seedboxRelativePath, long size) =>
        snapshot.Files.TryGetValue(RelPath.LocalSafe(seedboxRelativePath), out var f) && f.Size == size;
}
