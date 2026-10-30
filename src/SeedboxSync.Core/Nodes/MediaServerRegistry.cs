using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Peers;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Core.Nodes;

public enum MediaServerKind
{
    /// <summary>This PC. Runs inside the service and cannot be removed.</summary>
    Local,

    /// <summary>Another PC on the LAN running Seedbox Sync, added with a pairing code.</summary>
    Remote,
}

/// <summary>A media server as stored in servers.json.</summary>
public sealed class MediaServerConfig
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public MediaServerKind Kind { get; set; }
    public string LibraryRoot { get; set; } = string.Empty;

    /// <summary>Peer API base address, e.g. https://192.168.1.31:8743. Remote servers only; kept current by discovery.</summary>
    public string? Address { get; set; }

    /// <summary>Key that PC issued to this one at pairing. Remote servers only; encrypted on disk.</summary>
    public string? AgentKey { get; set; }

    /// <summary>That PC's permanent ID (see <see cref="InstanceIdentity"/>). Remote servers only.</summary>
    public string? InstanceId { get; set; }

    /// <summary>SHA-256 of that PC's certificate, pinned at pairing. Remote servers only.</summary>
    public string? CertThumbprint { get; set; }
}

/// <summary>
/// Knows every media server and hands out the <see cref="IMediaNode"/> that talks to it.
/// The rest of the service never cares whether a server is local or remote.
/// </summary>
public sealed class MediaServerRegistry
{
    public const string LocalId = "local";

    private readonly AppPaths _paths;
    private readonly ISeedboxClientFactory _clients;
    private readonly InstanceIdentity _identity;
    private readonly object _lock = new();
    private readonly Dictionary<string, IMediaNode> _nodes = new(StringComparer.OrdinalIgnoreCase);
    private List<MediaServerConfig> _servers;


    public MediaServerRegistry(AppPaths paths, ISeedboxClientFactory clients, InstanceIdentity identity)
    {
        _paths = paths;
        _clients = clients;
        _identity = identity;
        _servers = JsonFileStore.Read<List<MediaServerConfig>>(paths.ServersFile) ?? new List<MediaServerConfig>();
        // Incomplete remote entries are dropped; keys are decrypted in memory only.
        _servers.RemoveAll(s => s.Kind == MediaServerKind.Remote && (string.IsNullOrEmpty(s.Address) || string.IsNullOrEmpty(s.InstanceId)));
        foreach (var s in _servers.Where(x => x.Kind == MediaServerKind.Remote)) s.AgentKey = SecretProtector.Unprotect(s.AgentKey);
        if (!_servers.Any(s => s.Kind == MediaServerKind.Local))
        {
            _servers.Insert(0, new MediaServerConfig
            {
                Id = LocalId,
                Name = Environment.MachineName,
                Kind = MediaServerKind.Local,
                LibraryRoot = DefaultLibraryRoot(),
            });
            Persist();
        }
    }

    public event Action<string>? LibraryRootChanged;

    public IReadOnlyList<MediaServerConfig> All
    {
        get { lock (_lock) return _servers.Select(Copy).ToList(); }
    }

    public MediaServerConfig Local => All.First(s => s.Kind == MediaServerKind.Local);

    public MediaServerConfig? Find(string id)
    {
        lock (_lock) return _servers.Where(s => s.Id.Equals(id, StringComparison.OrdinalIgnoreCase)).Select(Copy).FirstOrDefault();
    }

    public MediaServerConfig Get(string id) =>
        Find(id) ?? throw new UserFacingException($"Unknown media server '{id}'.", 404);

    public IMediaNode GetNode(string id)
    {
        var cfg = Get(id);
        lock (_lock)
        {
            if (_nodes.TryGetValue(cfg.Id, out var node)) return node;
            node = cfg.Kind switch
            {
                MediaServerKind.Local => new LocalMediaNode(cfg.Id, () => Find(cfg.Id)?.LibraryRoot ?? string.Empty, _clients),
                _ => new RemoteMediaNode(cfg, _identity.Id),
            };
            _nodes[cfg.Id] = node;
            return node;
        }
    }

    public void SetLibraryRoot(string id, string root)
    {
        root = root.Trim();
        if (root.Length == 0) throw new UserFacingException("Enter a library folder.");
        if (!Path.IsPathFullyQualified(root))
            throw new UserFacingException("The library folder must be a full path, such as D:\\Media.");
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase))
                ?? throw new UserFacingException($"Unknown media server '{id}'.", 404);
            s.LibraryRoot = root;
            Persist();
        }
        LibraryRootChanged?.Invoke(id);
    }

    public void Rename(string id, string name)
    {
        name = name.Trim();
        if (name.Length == 0) throw new UserFacingException("Enter a name.");
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase))
                ?? throw new UserFacingException($"Unknown media server '{id}'.", 404);
            s.Name = name;
            Persist();
        }
    }

    /// <summary>
    /// Adds a paired PC, or refreshes it when it was added before (same instance ID): pairing
    /// again replaces the key and pinned certificate.
    /// </summary>
    public MediaServerConfig AddRemote(string instanceId, string name, string address, string libraryRoot, string key, string thumbprint)
    {
        if (instanceId == _identity.Id) throw new UserFacingException("That address is this PC.");
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Kind == MediaServerKind.Remote && x.InstanceId == instanceId);
            if (s == null)
            {
                s = new MediaServerConfig { Id = NewId(name), Kind = MediaServerKind.Remote, Name = name, InstanceId = instanceId };
                _servers.Add(s);
            }
            s.Address = address;
            s.LibraryRoot = libraryRoot;
            s.AgentKey = key;
            s.CertThumbprint = thumbprint;
            DropNode(s.Id);
            Persist();
            return Copy(s);
        }
    }

    /// <summary>Discovery heard a paired PC at a new address (DHCP): follow it.</summary>
    public void UpdateRemoteAddress(string instanceId, string address)
    {
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Kind == MediaServerKind.Remote && x.InstanceId == instanceId);
            if (s == null || string.Equals(s.Address, address, StringComparison.OrdinalIgnoreCase)) return;
            s.Address = address;
            DropNode(s.Id);
            Persist();
        }
    }

    /// <summary>Remembers the library folder a remote PC reported, for when it is offline.</summary>
    public void CacheLibraryRoot(string id, string root)
    {
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
            if (s == null || s.LibraryRoot == root) return;
            s.LibraryRoot = root;
            Persist();
        }
    }

    public void Remove(string id)
    {
        lock (_lock)
        {
            var s = _servers.FirstOrDefault(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase))
                ?? throw new UserFacingException($"Unknown media server '{id}'.", 404);
            if (s.Kind == MediaServerKind.Local) throw new UserFacingException("This PC runs the Seedbox Sync service. It cannot be removed.");
            _servers.Remove(s);
            DropNode(s.Id);
            Persist();
        }
    }

    private void DropNode(string id)
    {
        if (_nodes.Remove(id, out var old) && old is IDisposable d) d.Dispose();
    }

    private string NewId(string name)
    {
        var slug = new string(name.ToLowerInvariant().Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray()).Trim('-');
        if (slug.Length == 0) slug = "pc";
        var id = slug;
        for (var i = 2; _servers.Any(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase)); i++) id = $"{slug}-{i}";
        return id;
    }

    private void Persist()
    {
        var stored = _servers.Select(Copy).ToList();
        foreach (var s in stored.Where(x => x.Kind == MediaServerKind.Remote)) s.AgentKey = SecretProtector.Protect(s.AgentKey);
        JsonFileStore.Write(_paths.ServersFile, stored);
    }

    private static MediaServerConfig Copy(MediaServerConfig s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Kind = s.Kind,
        LibraryRoot = s.LibraryRoot,
        Address = s.Address,
        AgentKey = s.AgentKey,
        InstanceId = s.InstanceId,
        CertThumbprint = s.CertThumbprint,
    };

    private static string DefaultLibraryRoot()
    {
        var videos = Environment.GetFolderPath(Environment.SpecialFolder.CommonVideos);
        if (string.IsNullOrEmpty(videos)) videos = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
        return Path.Combine(videos, "Seedbox");
    }
}
