using SeedboxSync.Core.Common;

namespace SeedboxSync.Core.Library;

/// <summary>
/// What has been played, per media server and title (history.json). Seedbox Sync cannot see
/// inside the external player, so "played" means "opened with Play"; episodes can also be marked
/// watched or unwatched by hand. Drives "Up next" and "Continue watching".
/// </summary>
public sealed class WatchHistory
{
    public sealed class Entry
    {
        /// <summary>The file played most recently.</summary>
        public string? LastPath { get; set; }
        /// <summary>Last play or watched mark: orders "Continue watching".</summary>
        public DateTime LastPlayedUtc { get; set; }
        /// <summary>Files played or marked watched.</summary>
        public HashSet<string> Watched { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    }

    private sealed class Stored
    {
        public Dictionary<string, Entry> Titles { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    }

    private readonly string _file;
    private readonly object _lock = new();
    private readonly Stored _data;

    public WatchHistory(AppPaths paths)
    {
        _file = Path.Combine(paths.DataDirectory, "history.json");
        _data = JsonFileStore.Read<Stored>(_file) ?? new Stored();
        // JSON drops the comparers; put them back.
        _data.Titles = new Dictionary<string, Entry>(_data.Titles, StringComparer.OrdinalIgnoreCase);
        foreach (var e in _data.Titles.Values) e.Watched = new HashSet<string>(e.Watched, StringComparer.OrdinalIgnoreCase);
    }

    private static string Id(string serverId, string key) => serverId + "|" + key;

    public Entry? Get(string serverId, string key)
    {
        lock (_lock)
        {
            if (!_data.Titles.TryGetValue(Id(serverId, key), out var e)) return null;
            return new Entry { LastPath = e.LastPath, LastPlayedUtc = e.LastPlayedUtc, Watched = new HashSet<string>(e.Watched, StringComparer.OrdinalIgnoreCase) };
        }
    }

    /// <summary>Opened with Play: becomes the last played file and counts as watched.</summary>
    public void Played(string serverId, string key, string path)
    {
        lock (_lock)
        {
            var e = Ensure(serverId, key);
            e.LastPath = path;
            e.LastPlayedUtc = DateTime.UtcNow;
            e.Watched.Add(path);
            Persist();
        }
    }

    /// <summary>Marks files watched or unwatched without touching "last played".</summary>
    public void SetWatched(string serverId, string key, IEnumerable<string> paths, bool watched)
    {
        lock (_lock)
        {
            var e = Ensure(serverId, key);
            e.LastPlayedUtc = DateTime.UtcNow;
            foreach (var p in paths)
            {
                if (watched) e.Watched.Add(p);
                else e.Watched.Remove(p);
            }
            Persist();
        }
    }

    private Entry Ensure(string serverId, string key)
    {
        var id = Id(serverId, key);
        if (!_data.Titles.TryGetValue(id, out var e)) _data.Titles[id] = e = new Entry();
        return e;
    }

    private void Persist() => JsonFileStore.Write(_file, _data);
}
