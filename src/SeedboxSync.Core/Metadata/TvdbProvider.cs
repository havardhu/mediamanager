using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Library;

namespace SeedboxSync.Core.Metadata;

/// <summary>TheTVDB API v4 (series only). Uses a project API key; the login token is cached.</summary>
public sealed class TvdbProvider : IMetadataProvider
{
    private const string Api = "https://api4.thetvdb.com/v4";
    private readonly HttpClient _http;
    private readonly SettingsStore _settings;
    private readonly SemaphoreSlim _loginLock = new(1, 1);
    private string? _token;
    private string? _tokenKey;
    private DateTime _tokenExpires;

    public TvdbProvider(HttpClient http, SettingsStore settings)
    {
        _http = http;
        _settings = settings;
    }

    public string Name => "TVDB";

    private string Key => _settings.Current.Metadata.TvdbApiKey.Trim();

    public bool IsConfigured => Key.Length > 0;

    public bool Supports(MediaKind kind) => kind == MediaKind.Tv;

    public async Task<IReadOnlyList<MetadataCandidate>> SearchAsync(MediaKind kind, string query, int? year, CancellationToken ct)
    {
        var url = $"{Api}/search?query={Uri.EscapeDataString(query)}&type=series";
        if (year != null) url += $"&year={year}";
        using var doc = await GetAsync(url, ct);
        var list = doc.RootElement.Arr("data").Select(r => new MetadataCandidate(
            Name,
            r.Str("tvdb_id") ?? r.Str("id")?.Replace("series-", "") ?? "",
            r.Str("name") ?? "",
            r.Int("year"),
            r.Str("network"),
            r.Str("image_url") ?? r.Str("thumbnail"),
            0)).Where(c => c.Id.Length > 0).ToList();
        if (list.Count == 0 && year != null) return await SearchAsync(kind, query, null, ct);
        return list;
    }

    public async Task<MetadataDetails> GetDetailsAsync(MediaKind kind, string id, CancellationToken ct)
    {
        using var doc = await GetAsync($"{Api}/series/{Uri.EscapeDataString(id)}/extended?meta=episodes", ct);
        var d = doc.RootElement.Prop("data") ?? throw new UserFacingException("TVDB returned no data for that series.", 502);
        var runtime = d.Int("averageRuntime");
        var episodes = d.Arr("episodes")
            .Where(e => (e.Int("seasonNumber") ?? 0) > 0 && e.Int("number") != null)
            .Select(e => new EpisodeInfo(e.Int("seasonNumber")!.Value, e.Int("number")!.Value, e.Str("name") ?? $"Episode {e.Int("number")}", e.Int("runtime") ?? runtime, AirDate(e.Str("aired"))))
            .ToList();
        string? background = null;
        foreach (var a in d.Arr("artworks"))
        {
            if (a.Int("type") == 3 && a.Str("image") is { } img)
            {
                background = img;
                break;
            }
        }
        string? tmdb = null, imdb = null;
        foreach (var r in d.Arr("remoteIds"))
        {
            var src = r.Str("sourceName") ?? "";
            if (src.Contains("TheMovieDB", StringComparison.OrdinalIgnoreCase)) tmdb = r.Str("id");
            if (src.Contains("IMDB", StringComparison.OrdinalIgnoreCase)) imdb = r.Str("id");
        }
        var network = d.Prop("originalNetwork")?.Str("name") ?? d.Prop("latestNetwork")?.Str("name");
        return new MetadataDetails(
            Name,
            id,
            d.Str("name") ?? "",
            d.Int("year") ?? J.YearOf(d.Str("firstAired")),
            network,
            d.Str("overview"),
            runtime,
            d.Str("image"),
            background,
            imdb,
            tmdb,
            d.Arr("genres").Select(g => g.Str("name")).Where(n => n != null).Select(n => n!).ToList(),
            episodes);
    }

    /// <summary>"2024-01-10" (or a longer timestamp) → "2024-01-10"; anything else → null.</summary>
    internal static string? AirDate(string? s) =>
        s != null && s.Length >= 10 && DateOnly.TryParseExact(s[..10], "yyyy-MM-dd", out _) ? s[..10] : null;

    private async Task<JsonDocument> GetAsync(string url, CancellationToken ct, bool retried = false)
    {
        var token = await TokenAsync(ct);
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var res = await _http.SendAsync(req, ct);
        if (res.StatusCode == HttpStatusCode.Unauthorized && !retried)
        {
            _token = null;
            return await GetAsync(url, ct, true);
        }
        if (res.StatusCode == HttpStatusCode.NotFound)
            throw new UserFacingException("TVDB has no entry with that id.", 404);
        res.EnsureSuccessStatusCode();
        await using var s = await res.Content.ReadAsStreamAsync(ct);
        return await JsonDocument.ParseAsync(s, cancellationToken: ct);
    }

    private async Task<string> TokenAsync(CancellationToken ct)
    {
        var key = Key;
        if (key.Length == 0) throw new UserFacingException("Add a TVDB API key in Settings → Metadata providers.");
        if (_token != null && _tokenKey == key && DateTime.UtcNow < _tokenExpires) return _token;
        await _loginLock.WaitAsync(ct);
        try
        {
            if (_token != null && _tokenKey == key && DateTime.UtcNow < _tokenExpires) return _token;
            using var res = await _http.PostAsJsonAsync($"{Api}/login", new { apikey = key }, ct);
            if (res.StatusCode == HttpStatusCode.Unauthorized)
                throw new UserFacingException("TVDB rejected the API key. Check it in Settings → Metadata providers.");
            res.EnsureSuccessStatusCode();
            await using var s = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(s, cancellationToken: ct);
            var token = doc.RootElement.Prop("data")?.Str("token")
                ?? throw new UserFacingException("TVDB login returned no token.", 502);
            _token = token;
            _tokenKey = key;
            _tokenExpires = DateTime.UtcNow.AddDays(25);
            return token;
        }
        finally
        {
            _loginLock.Release();
        }
    }
}
