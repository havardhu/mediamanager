using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Core.Transfers;

public enum TransferStatus
{
    Queued,
    Active,
    Done,
    Failed,
}

/// <summary>One file going from the seedbox to one media server.</summary>
public sealed class TransferItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string ServerId { get; set; } = string.Empty;

    /// <summary>Path relative to the seedbox media root (and to the server's library root).</summary>
    public string Path { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTime? RemoteModifiedUtc { get; set; }
    public TransferStatus Status { get; set; }
    public long Transferred { get; set; }
    public double BytesPerSecond { get; set; }
    public int Attempts { get; set; }
    public string? Error { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedUtc { get; set; }
    public DateTime? NotBeforeUtc { get; set; }

    public TransferItem Copy() => (TransferItem)MemberwiseClone();
}

public sealed class TransferQueueState
{
    public bool Paused { get; set; }
    public List<TransferItem> Items { get; set; } = new();
}

public sealed record EnqueueResult(int Files, long Bytes, int Skipped);

/// <summary>
/// Download queue shared by all media servers. The scheduler runs up to N transfers at once
/// (Settings → Parallel transfers), each executed by the target server's node, so a remote
/// agent pulls straight from the seedbox. State is persisted; transfers resume after a restart.
/// </summary>
public sealed class TransferQueue : BackgroundService
{
    private const int MaxAttempts = 4;
    private const int KeepCompleted = 200;

    private readonly SettingsStore _settings;
    private readonly MediaServerRegistry _servers;
    private readonly InventoryService _inventory;
    private readonly AppPaths _paths;
    private readonly ILogger<TransferQueue> _log;
    private readonly object _lock = new();
    private readonly Dictionary<string, Running> _running = new();
    private readonly TransferQueueState _state;
    private bool _dirty;
    private DateTime _lastSave = DateTime.MinValue;

    private sealed class Running
    {
        public required CancellationTokenSource Cts { get; init; }
        public bool CancelledByUser { get; set; }
        public long WindowBytes { get; set; }
        public DateTime WindowStart { get; set; } = DateTime.UtcNow;
    }

    public TransferQueue(SettingsStore settings, MediaServerRegistry servers, InventoryService inventory, AppPaths paths, ILogger<TransferQueue> log)
    {
        _settings = settings;
        _servers = servers;
        _inventory = inventory;
        _paths = paths;
        _log = log;
        _state = JsonFileStore.Read<TransferQueueState>(paths.TransfersFile) ?? new TransferQueueState();
        foreach (var t in _state.Items.Where(x => x.Status == TransferStatus.Active))
        {
            t.Status = TransferStatus.Queued;
            t.BytesPerSecond = 0;
        }
    }

    /// <summary>Raised when a file has fully arrived on a server: (serverId, relative path).</summary>
    public event Action<string, string>? FileCompleted;

    public bool Paused
    {
        get { lock (_lock) return _state.Paused; }
    }

    public IReadOnlyList<TransferItem> Snapshot()
    {
        lock (_lock) return _state.Items.Select(t => t.Copy()).ToList();
    }

    public EnqueueResult Enqueue(string serverId, IEnumerable<CatalogEntry> files)
    {
        _servers.Get(serverId);
        int added = 0, skipped = 0;
        long bytes = 0;
        lock (_lock)
        {
            var pending = new HashSet<string>(
                _state.Items.Where(t => t.ServerId == serverId && t.Status is TransferStatus.Queued or TransferStatus.Active)
                    .Select(t => t.Path),
                RelPath.Comparer);
            foreach (var f in files.Where(x => !x.IsDirectory))
            {
                if (!pending.Add(f.Path))
                {
                    skipped++;
                    continue;
                }
                // A failed earlier attempt for the same file is replaced by the new one.
                _state.Items.RemoveAll(t => t.ServerId == serverId && t.Status == TransferStatus.Failed && RelPath.Comparer.Equals(t.Path, f.Path));
                _state.Items.Add(new TransferItem
                {
                    ServerId = serverId,
                    Path = f.Path,
                    Size = f.Size,
                    RemoteModifiedUtc = f.ModifiedUtc,
                    Status = TransferStatus.Queued,
                });
                added++;
                bytes += f.Size;
            }
            _dirty = true;
        }
        SaveIfDue(force: true);
        return new EnqueueResult(added, bytes, skipped);
    }

    public void SetPaused(bool paused)
    {
        List<Running> toStop;
        lock (_lock)
        {
            _state.Paused = paused;
            toStop = paused ? _running.Values.ToList() : new List<Running>();
            _dirty = true;
        }
        foreach (var r in toStop) SafeCancel(r);
        SaveIfDue(force: true);
    }

    public void Cancel(string id)
    {
        TransferItem? item;
        Running? running;
        lock (_lock)
        {
            item = _state.Items.FirstOrDefault(t => t.Id == id);
            if (item == null) return;
            if (_running.TryGetValue(id, out running)) running.CancelledByUser = true;
            else _state.Items.Remove(item);
            _dirty = true;
        }
        if (running != null) SafeCancel(running);
        else if (item.Status != TransferStatus.Done) _ = DiscardAsync(item);
        SaveIfDue(force: true);
    }

    /// <summary>Cancels queued and active transfers for files at or below the given paths (used when deleting from the seedbox).</summary>
    public int CancelUnder(IEnumerable<string> rels)
    {
        var roots = rels.ToList();
        List<string> ids;
        lock (_lock)
        {
            ids = _state.Items
                .Where(t => t.Status is TransferStatus.Queued or TransferStatus.Active or TransferStatus.Failed)
                .Where(t => roots.Any(r => RelPath.IsSameOrUnder(t.Path, r)))
                .Select(t => t.Id)
                .ToList();
        }
        foreach (var id in ids) Cancel(id);
        return ids.Count;
    }

    public void Retry(string id)
    {
        lock (_lock)
        {
            var t = _state.Items.FirstOrDefault(x => x.Id == id);
            if (t == null || t.Status != TransferStatus.Failed) return;
            t.Status = TransferStatus.Queued;
            t.Attempts = 0;
            t.Error = null;
            t.NotBeforeUtc = null;
            _dirty = true;
        }
        SaveIfDue(force: true);
    }

    public int ClearFinished()
    {
        int n;
        lock (_lock)
        {
            n = _state.Items.RemoveAll(t => t.Status is TransferStatus.Done or TransferStatus.Failed);
            _dirty = true;
        }
        SaveIfDue(force: true);
        return n;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                Schedule(stoppingToken);
                UpdateSpeeds();
                SaveIfDue(force: false);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Transfer scheduler error");
            }
            try { await Task.Delay(500, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }

        List<Running> running;
        lock (_lock) running = _running.Values.ToList();
        foreach (var r in running) SafeCancel(r);
        SaveIfDue(force: true);
    }

    private void Schedule(CancellationToken stoppingToken)
    {
        var parallel = Math.Max(1, _settings.Current.Transfers.Parallel);
        var seedbox = _settings.Current.Seedbox;
        if (!seedbox.IsConfigured) return;
        var now = DateTime.UtcNow;
        var start = new List<TransferItem>();
        lock (_lock)
        {
            if (_state.Paused) return;
            var slots = parallel - _running.Count;
            if (slots <= 0) return;
            foreach (var t in _state.Items)
            {
                if (slots <= 0) break;
                if (t.Status != TransferStatus.Queued) continue;
                if (t.NotBeforeUtc is { } nb && nb > now) continue;
                // A remote PC that just failed to answer keeps its queue until it is back.
                var server = _servers.Find(t.ServerId);
                if (server == null) continue;
                if (server.Kind == MediaServerKind.Remote && _servers.GetNode(server.Id) is RemoteMediaNode { KnownOffline: true }) continue;
                t.Status = TransferStatus.Active;
                t.Error = null;
                t.Attempts++;
                var running = new Running { Cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken) };
                _running[t.Id] = running;
                start.Add(t);
                slots--;
                _dirty = true;
            }
        }
        foreach (var t in start) _ = RunAsync(t, seedbox);
    }

    private async Task RunAsync(TransferItem item, SeedboxSettings seedbox)
    {
        Running running;
        lock (_lock) running = _running[item.Id];
        var ct = running.Cts.Token;
        try
        {
            var node = _servers.GetNode(item.ServerId);
            var request = new NodeDownloadRequest(
                SeedboxConnection.From(seedbox),
                RelPath.ToRemote(seedbox.MediaRoot, item.Path),
                item.Path,
                item.Size,
                item.RemoteModifiedUtc);
            var file = await node.DownloadFromSeedboxAsync(request, pos =>
            {
                lock (_lock)
                {
                    var delta = pos - item.Transferred;
                    item.Transferred = pos;
                    if (delta > 0) running.WindowBytes += delta;
                }
            }, ct);

            lock (_lock)
            {
                item.Status = TransferStatus.Done;
                item.Transferred = item.Size;
                item.BytesPerSecond = 0;
                item.CompletedUtc = DateTime.UtcNow;
                item.NotBeforeUtc = null;
                _dirty = true;
                TrimCompleted();
            }
            _inventory.Upsert(item.ServerId, file);
            _log.LogInformation("Downloaded {Path} to {Server}", item.Path, item.ServerId);
            try { FileCompleted?.Invoke(item.ServerId, item.Path); }
            catch (Exception ex) { _log.LogWarning(ex, "FileCompleted handler failed"); }
        }
        catch (OperationCanceledException)
        {
            var byUser = false;
            lock (_lock)
            {
                byUser = running.CancelledByUser;
                if (byUser) _state.Items.Remove(item);
                else
                {
                    // Paused or shutting down: keep the partial file and resume later.
                    item.Status = TransferStatus.Queued;
                    item.Attempts = Math.Max(0, item.Attempts - 1);
                }
                item.BytesPerSecond = 0;
                _dirty = true;
            }
            if (byUser) await DiscardAsync(item);
        }
        catch (Exception ex)
        {
            var message = ex is UserFacingException or RemoteNodeException ? ex.Message : SeedboxCatalog.Describe(ex, seedbox);
            _log.LogWarning(ex, "Transfer of {Path} failed (attempt {Attempt})", item.Path, item.Attempts);
            lock (_lock)
            {
                item.BytesPerSecond = 0;
                item.Error = message;
                if (item.Attempts < MaxAttempts && ex is not UserFacingException)
                {
                    item.Status = TransferStatus.Queued;
                    item.NotBeforeUtc = DateTime.UtcNow.AddSeconds(15 * item.Attempts);
                }
                else
                {
                    item.Status = TransferStatus.Failed;
                }
                _dirty = true;
            }
        }
        finally
        {
            lock (_lock) _running.Remove(item.Id);
            running.Cts.Dispose();
        }
    }

    private static void SafeCancel(Running r)
    {
        try { r.Cts.Cancel(); }
        catch (ObjectDisposedException) { }
    }

    private void UpdateSpeeds()
    {
        var now = DateTime.UtcNow;
        lock (_lock)
        {
            foreach (var (id, r) in _running)
            {
                var elapsed = (now - r.WindowStart).TotalSeconds;
                if (elapsed < 1) continue;
                var item = _state.Items.FirstOrDefault(t => t.Id == id);
                if (item == null) continue;
                var instant = r.WindowBytes / elapsed;
                item.BytesPerSecond = item.BytesPerSecond <= 0 ? instant : item.BytesPerSecond * 0.6 + instant * 0.4;
                r.WindowBytes = 0;
                r.WindowStart = now;
            }
        }
    }

    private void TrimCompleted()
    {
        var done = _state.Items.Where(t => t.Status == TransferStatus.Done).OrderByDescending(t => t.CompletedUtc).Skip(KeepCompleted).ToList();
        foreach (var d in done) _state.Items.Remove(d);
    }

    private async Task DiscardAsync(TransferItem item)
    {
        try
        {
            if (_servers.Find(item.ServerId) == null) return;
            await _servers.GetNode(item.ServerId).DiscardPartialAsync(item.Path, CancellationToken.None);
        }
        catch (Exception ex)
        {
            _log.LogDebug(ex, "Could not discard partial file for {Path}", item.Path);
        }
    }

    private void SaveIfDue(bool force)
    {
        TransferQueueState? copy = null;
        lock (_lock)
        {
            if (!_dirty) return;
            if (!force && DateTime.UtcNow - _lastSave < TimeSpan.FromSeconds(3)) return;
            copy = new TransferQueueState { Paused = _state.Paused, Items = _state.Items.Select(t => t.Copy()).ToList() };
            _dirty = false;
            _lastSave = DateTime.UtcNow;
        }
        try
        {
            JsonFileStore.Write(_paths.TransfersFile, copy);
        }
        catch (IOException ex)
        {
            _log.LogWarning(ex, "Could not save transfers");
            lock (_lock) _dirty = true;
        }
    }
}
