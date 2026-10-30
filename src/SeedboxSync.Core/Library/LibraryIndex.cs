using SeedboxSync.Core.Common;

namespace SeedboxSync.Core.Library;

/// <summary>Per-server title metadata (matches, artwork flags, episode names), one JSON file per server.</summary>
public sealed class LibraryIndex
{
    private readonly AppPaths _paths;
    private readonly object _lock = new();
    private readonly Dictionary<string, Dictionary<string, TitleMeta>> _cache = new(StringComparer.OrdinalIgnoreCase);

    public LibraryIndex(AppPaths paths) => _paths = paths;

    public TitleMeta? Get(string serverId, string key)
    {
        lock (_lock) return Load(serverId).TryGetValue(key, out var m) ? m : null;
    }

    public IReadOnlyDictionary<string, TitleMeta> All(string serverId)
    {
        lock (_lock) return new Dictionary<string, TitleMeta>(Load(serverId), StringComparer.OrdinalIgnoreCase);
    }

    public void Set(string serverId, string key, TitleMeta meta)
    {
        lock (_lock)
        {
            meta.UpdatedUtc = DateTime.UtcNow;
            Load(serverId)[key] = meta;
            JsonFileStore.Write(_paths.LibraryIndexFile(serverId), new LibraryIndexFile { Titles = Load(serverId) });
        }
    }

    public void Clear(string serverId)
    {
        lock (_lock)
        {
            _cache[serverId] = new Dictionary<string, TitleMeta>(StringComparer.OrdinalIgnoreCase);
            JsonFileStore.Write(_paths.LibraryIndexFile(serverId), new LibraryIndexFile());
        }
    }

    private Dictionary<string, TitleMeta> Load(string serverId)
    {
        if (_cache.TryGetValue(serverId, out var d)) return d;
        var file = JsonFileStore.Read<LibraryIndexFile>(_paths.LibraryIndexFile(serverId));
        d = new Dictionary<string, TitleMeta>(file?.Titles ?? new Dictionary<string, TitleMeta>(), StringComparer.OrdinalIgnoreCase);
        _cache[serverId] = d;
        return d;
    }

    public string ArtworkPath(string serverId, string key, string kind)
    {
        var hash = Convert.ToHexString(System.Security.Cryptography.SHA1.HashData(System.Text.Encoding.UTF8.GetBytes(key.ToLowerInvariant())))[..16];
        return Path.Combine(_paths.ArtworkDirectory, AppPaths.Safe(serverId), hash, kind + ".jpg");
    }
}
