using System.Net.Sockets;
using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;

namespace SeedboxSync.Core.Seedbox;

/// <summary>A file or folder under the seedbox media root, by relative path.</summary>
public sealed record CatalogEntry(string Path, bool IsDirectory, long Size, DateTime? ModifiedUtc);

public sealed class CatalogState
{
    public List<CatalogEntry> Entries { get; set; } = new();
    public string MediaRoot { get; set; } = string.Empty;
    public DateTime? RefreshedUtc { get; set; }
    public long? TotalBytes { get; set; }
    public long? FreeBytes { get; set; }
}

public sealed record ConnectionStatus(bool Configured, bool Connected, bool Refreshing, string? Error, DateTime? RefreshedUtc);

public sealed record TestResult(bool Ok, string Message);

/// <summary>
/// The service's picture of the seedbox: a cached recursive listing of the media root,
/// refreshed on demand and on a timer, plus delete. The cache is persisted so the UI has
/// something to show right after a restart.
/// </summary>
public sealed class SeedboxCatalog
{
    private readonly SettingsStore _settings;
    private readonly ISeedboxClientFactory _clients;
    private readonly AppPaths _paths;
    private readonly ILogger<SeedboxCatalog> _log;
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly object _lock = new();
    private CatalogState _state;
    private bool _connected;
    private bool _refreshing;
    private string? _error;

    public SeedboxCatalog(SettingsStore settings, ISeedboxClientFactory clients, AppPaths paths, ILogger<SeedboxCatalog> log)
    {
        _settings = settings;
        _clients = clients;
        _paths = paths;
        _log = log;
        _state = JsonFileStore.Read<CatalogState>(paths.SeedboxCacheFile) ?? new CatalogState();
        if (_state.MediaRoot != settings.Current.Seedbox.MediaRoot) _state = new CatalogState();
    }

    /// <summary>Raised after every refresh or delete.</summary>
    public event Action? Changed;

    public CatalogState State
    {
        get
        {
            lock (_lock)
            {
                return new CatalogState
                {
                    Entries = _state.Entries,
                    MediaRoot = _state.MediaRoot,
                    RefreshedUtc = _state.RefreshedUtc,
                    TotalBytes = _state.TotalBytes,
                    FreeBytes = _state.FreeBytes,
                };
            }
        }
    }

    public ConnectionStatus Status
    {
        get
        {
            var configured = _settings.Current.Seedbox.IsConfigured;
            lock (_lock) return new ConnectionStatus(configured, configured && _connected, _refreshing, _error, _state.RefreshedUtc);
        }
    }

    public CatalogEntry? Find(string rel)
    {
        lock (_lock) return _state.Entries.FirstOrDefault(e => RelPath.Comparer.Equals(e.Path, rel));
    }

    /// <summary>All files at or below the given relative paths.</summary>
    public IReadOnlyList<CatalogEntry> FilesUnder(IEnumerable<string> rels)
    {
        var roots = rels.Select(RelPath.Normalize).ToList();
        lock (_lock)
        {
            return _state.Entries
                .Where(e => !e.IsDirectory && roots.Any(r => RelPath.IsSameOrUnder(e.Path, r)))
                .ToList();
        }
    }

    public async Task RefreshAsync(CancellationToken ct)
    {
        var s = _settings.Current.Seedbox;
        if (!s.IsConfigured)
        {
            lock (_lock) { _connected = false; _error = null; }
            return;
        }

        await _gate.WaitAsync(ct);
        try
        {
            lock (_lock) _refreshing = true;
            Changed?.Invoke();
            await using var client = _clients.Create(SeedboxConnection.From(s));
            await client.ConnectAsync(ct);
            if (!await client.DirectoryExistsAsync(s.MediaRoot, ct))
                throw new UserFacingException($"Connected, but {s.MediaRoot} does not exist on the seedbox.");
            var remote = await client.ListRecursiveAsync(s.MediaRoot, ct);
            var storage = await client.GetStorageAsync(s.MediaRoot, ct);

            var entries = new List<CatalogEntry>(remote.Count);
            foreach (var r in remote)
            {
                var rel = RelPath.FromRemote(s.MediaRoot, r.FullPath);
                if (string.IsNullOrEmpty(rel)) continue;
                entries.Add(new CatalogEntry(rel, r.IsDirectory, r.IsDirectory ? 0 : r.Size, r.ModifiedUtc));
            }
            entries.Sort((a, b) => StringComparer.OrdinalIgnoreCase.Compare(a.Path, b.Path));

            var state = new CatalogState
            {
                Entries = entries,
                MediaRoot = s.MediaRoot,
                RefreshedUtc = DateTime.UtcNow,
                TotalBytes = storage?.TotalBytes,
                FreeBytes = storage?.FreeBytes,
            };
            lock (_lock)
            {
                _state = state;
                _connected = true;
                _error = null;
            }
            JsonFileStore.Write(_paths.SeedboxCacheFile, state);
            _log.LogInformation("Seedbox listing refreshed: {Count} entries under {Root}", entries.Count, s.MediaRoot);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            var msg = Describe(ex, s);
            _log.LogWarning(ex, "Seedbox refresh failed: {Message}", msg);
            lock (_lock)
            {
                _connected = false;
                _error = msg;
            }
            throw new UserFacingException(msg, 502, ex);
        }
        finally
        {
            lock (_lock) _refreshing = false;
            _gate.Release();
            Changed?.Invoke();
        }
    }

    /// <summary>Tries the given (unsaved) settings without changing anything.</summary>
    public async Task<TestResult> TestAsync(SeedboxSettings s, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(s.Host)) return new TestResult(false, "Enter a host first.");
        try
        {
            await using var client = _clients.Create(SeedboxConnection.From(s));
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeout.CancelAfter(TimeSpan.FromSeconds(30));
            await client.ConnectAsync(timeout.Token);
            if (string.IsNullOrWhiteSpace(s.MediaRoot))
                return new TestResult(false, "Connected, but no media root is set.");
            if (!await client.DirectoryExistsAsync(s.MediaRoot, timeout.Token))
                return new TestResult(false, $"Connected, but {s.MediaRoot} does not exist on the seedbox.");
            var top = await client.ListAsync(s.MediaRoot, timeout.Token);
            var folders = top.Count(e => e.IsDirectory);
            return new TestResult(true, $"Connected · {s.Protocol.ToString().ToUpperInvariant()} · {folders} {(folders == 1 ? "folder" : "folders")} under {s.MediaRoot}");
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
        {
            return new TestResult(false, Describe(ex, s));
        }
    }

    /// <summary>
    /// Deletes files or folders from the seedbox. The media root and its top-level category
    /// folders (Movies, TV, ...) are structural and cannot be deleted here.
    /// </summary>
    public async Task<IReadOnlyList<string>> DeleteAsync(IEnumerable<string> rels, CancellationToken ct)
    {
        var s = _settings.Current.Seedbox;
        if (!s.IsConfigured) throw new UserFacingException("Connect a seedbox first.");
        var targets = rels.Select(RelPath.Normalize).Distinct(RelPath.Comparer).ToList();
        if (targets.Count == 0) throw new UserFacingException("Select something to delete.");
        if (targets.Any(t => RelPath.Depth(t) < 2))
            throw new UserFacingException("Category folders belong to the media root and cannot be deleted here. Select the items inside instead.");

        await _gate.WaitAsync(ct);
        var deleted = new List<string>();
        try
        {
            await using var client = _clients.Create(SeedboxConnection.From(s));
            await client.ConnectAsync(ct);
            foreach (var t in targets)
            {
                var entry = Find(t);
                if (entry == null) continue;
                var remote = RelPath.ToRemote(s.MediaRoot, t);
                if (entry.IsDirectory) await client.DeleteDirectoryAsync(remote, ct);
                else await client.DeleteFileAsync(remote, ct);
                deleted.Add(t);
                lock (_lock)
                {
                    _state.Entries = _state.Entries.Where(e => !RelPath.IsSameOrUnder(e.Path, t)).ToList();
                }
            }
            lock (_lock) JsonFileStore.Write(_paths.SeedboxCacheFile, _state);
        }
        catch (Exception ex) when (ex is not UserFacingException && ex is not OperationCanceledException)
        {
            throw new UserFacingException("Delete failed: " + Describe(ex, s) + (deleted.Count > 0 ? $" {deleted.Count} item(s) were deleted before the error." : ""), 502, ex);
        }
        finally
        {
            _gate.Release();
            Changed?.Invoke();
        }
        return deleted;
    }

    public void ResetIfRootChanged()
    {
        var root = _settings.Current.Seedbox.MediaRoot;
        lock (_lock)
        {
            if (_state.MediaRoot == root) return;
            _state = new CatalogState { MediaRoot = root };
            _connected = false;
            _error = null;
        }
        Changed?.Invoke();
    }

    /// <summary>Turns library exceptions into sentences for the UI.</summary>
    public static string Describe(Exception ex, SeedboxSettings s) => Describe(ex, s.Host, s.Port);

    public static string Describe(Exception ex, string host, int port)
    {
        if (ex is UserFacingException u) return u.Message;
        for (var e = ex; e != null; e = e.InnerException)
        {
            var name = e.GetType().Name;
            if (e is System.Security.Authentication.AuthenticationException)
                return "TLS handshake failed. Check the protocol (FTPS needs port 21 or 990).";
            if (name.Contains("Authentication", StringComparison.OrdinalIgnoreCase))
                return "Login failed. Check the username and password.";
            if (e is SocketException se)
                return se.SocketErrorCode == SocketError.HostNotFound
                    ? $"Could not find {host}. Check the host name."
                    : $"Could not reach {host}:{port}. Check the host, port and protocol.";
            if (e is TimeoutException || e is OperationCanceledException || name.Contains("Timeout", StringComparison.OrdinalIgnoreCase))
                return $"{host} did not answer in time. Check the port and protocol.";
            if (name.Contains("PathNotFound", StringComparison.OrdinalIgnoreCase))
                return "A path on the seedbox no longer exists. Refresh and try again.";
            if (name.Contains("PermissionDenied", StringComparison.OrdinalIgnoreCase))
                return "The seedbox denied permission for that path.";
        }
        return ex.Message;
    }
}
