using SeedboxSync.Core.Common;
using SeedboxSync.Core.Library;

namespace SeedboxSync.Core.Discover;

/// <summary>
/// Something you want to get: a movie or series from Discover, or one episode of a series in
/// your library (<see cref="Season"/>/<see cref="Episode"/> set, with the library title it belongs to).
/// </summary>
public sealed class WantedItem
{
    public MediaKind Kind { get; set; }
    /// <summary>TMDB id; may be empty for an episode of a library series that is not matched on TMDB.</summary>
    public string TmdbId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? PosterUrl { get; set; }
    public DateTime AddedUtc { get; set; } = DateTime.UtcNow;
    public int? Season { get; set; }
    public int? Episode { get; set; }
    public string? EpisodeTitle { get; set; }
    /// <summary>For episodes: the media server and library title (series) they belong to.</summary>
    public string? ServerId { get; set; }
    public string? TitleKey { get; set; }

    public bool IsEpisode => Season != null && Episode != null;

    /// <summary>Identity on the list: "movie:603", "tv:1399", "ep:local/TV/Show (2024):2:5".</summary>
    public string Id => IsEpisode ? $"ep:{ServerId}/{TitleKey}:{Season}:{Episode}" : (Kind == MediaKind.Tv ? "tv:" : "movie:") + TmdbId;
}

/// <summary>The download list (wanted.json). Its status (on the seedbox, in the library) is worked out live.</summary>
public sealed class WantedList
{
    private readonly string _file;
    private readonly object _lock = new();
    private readonly List<WantedItem> _items;

    public WantedList(AppPaths paths)
    {
        _file = Path.Combine(paths.DataDirectory, "wanted.json");
        _items = JsonFileStore.Read<List<WantedItem>>(_file) ?? new List<WantedItem>();
    }

    public IReadOnlyList<WantedItem> All
    {
        get { lock (_lock) return _items.OrderByDescending(i => i.AddedUtc).ToList(); }
    }

    /// <summary>Whether a whole movie or series (not one of its episodes) is on the list.</summary>
    public bool Contains(MediaKind kind, string tmdbId)
    {
        lock (_lock) return _items.Any(i => !i.IsEpisode && i.Kind == kind && i.TmdbId == tmdbId);
    }

    public void Add(WantedItem item)
    {
        if (item.IsEpisode)
        {
            if (string.IsNullOrWhiteSpace(item.ServerId) || string.IsNullOrWhiteSpace(item.TitleKey))
                throw new UserFacingException("An episode needs the series it belongs to.");
            item.Kind = MediaKind.Tv;
        }
        else if (item.Kind is not (MediaKind.Movie or MediaKind.Tv) || string.IsNullOrWhiteSpace(item.TmdbId))
        {
            throw new UserFacingException("Only movies, series and episodes can be added.");
        }
        lock (_lock)
        {
            if (_items.Any(i => i.Id == item.Id)) return;
            item.AddedUtc = DateTime.UtcNow;
            _items.Add(item);
            JsonFileStore.Write(_file, _items);
        }
    }

    public void Remove(MediaKind kind, string tmdbId) => Remove((kind == MediaKind.Tv ? "tv:" : "movie:") + tmdbId);

    public void Remove(string id)
    {
        lock (_lock)
        {
            if (_items.RemoveAll(i => i.Id == id) > 0) JsonFileStore.Write(_file, _items);
        }
    }
}
