using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Metadata;

namespace SeedboxSync.Core.Discover;

/// <summary>IMDb, Rotten Tomatoes and Metacritic scores for one title.</summary>
public sealed record Ratings(double? Imdb, int? ImdbVotes, int? RottenTomatoes, int? Metacritic, string ImdbUrl);

/// <summary>
/// IMDb has no free API; OMDb (omdbapi.com, free key with 1,000 requests a day) returns its
/// rating plus Rotten Tomatoes and Metacritic. Results are cached for a week (ratings.json), so
/// browsing the same titles again costs nothing.
/// </summary>
public sealed class OmdbClient
{
    private static readonly TimeSpan CacheAge = TimeSpan.FromDays(7);

    private sealed class CacheEntry
    {
        public Ratings? Ratings { get; set; }
        public DateTime FetchedUtc { get; set; }
    }

    private readonly HttpClient _http;
    private readonly SettingsStore _settings;
    private readonly string _file;
    private readonly object _lock = new();
    private readonly Dictionary<string, CacheEntry> _cache;

    public OmdbClient(HttpClient http, SettingsStore settings, AppPaths paths)
    {
        _http = http;
        _settings = settings;
        _file = Path.Combine(paths.DataDirectory, "ratings.json");
        _cache = JsonFileStore.Read<Dictionary<string, CacheEntry>>(_file) ?? new Dictionary<string, CacheEntry>();
    }

    public bool IsConfigured => _settings.Current.Metadata.OmdbApiKey.Length > 0;

    /// <summary>Null when no OMDb key is set, the IMDb id is unknown, or OMDb has no entry.</summary>
    public async Task<Ratings?> GetAsync(string? imdbId, CancellationToken ct)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(imdbId) || !imdbId.StartsWith("tt", StringComparison.Ordinal)) return null;
        lock (_lock)
        {
            if (_cache.TryGetValue(imdbId, out var c) && DateTime.UtcNow - c.FetchedUtc < CacheAge) return c.Ratings;
        }
        var url = $"https://www.omdbapi.com/?i={Uri.EscapeDataString(imdbId)}&apikey={Uri.EscapeDataString(_settings.Current.Metadata.OmdbApiKey)}";
        JsonElement root;
        try
        {
            using var res = await _http.GetAsync(url, ct);
            if (res.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                throw new UserFacingException("OMDb rejected the API key, or today's 1,000 lookups are used up. Check it in Settings → Metadata providers.", 502);
            res.EnsureSuccessStatusCode();
            root = await res.Content.ReadFromJsonAsync<JsonElement>(ct);
        }
        catch (HttpRequestException)
        {
            return null;
        }
        Ratings? ratings = null;
        if (root.Str("Response") == "True")
        {
            int? rt = null, mc = null;
            foreach (var r in root.Arr("Ratings"))
            {
                var source = r.Str("Source");
                var value = r.Str("Value") ?? "";
                if (source == "Rotten Tomatoes" && int.TryParse(value.TrimEnd('%'), out var p)) rt = p;
                if (source == "Metacritic" && int.TryParse(value.Split('/')[0], out var m)) mc = m;
            }
            ratings = new Ratings(
                double.TryParse(root.Str("imdbRating"), NumberStyles.Float, CultureInfo.InvariantCulture, out var imdb) ? imdb : null,
                int.TryParse((root.Str("imdbVotes") ?? "").Replace(",", ""), out var votes) ? votes : null,
                rt,
                mc ?? (int.TryParse(root.Str("Metascore"), out var ms) ? ms : null),
                $"https://www.imdb.com/title/{imdbId}/");
        }
        lock (_lock)
        {
            _cache[imdbId] = new CacheEntry { Ratings = ratings, FetchedUtc = DateTime.UtcNow };
            JsonFileStore.Write(_file, _cache);
        }
        return ratings;
    }
}
