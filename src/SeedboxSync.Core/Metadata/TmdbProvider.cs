using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Library;

namespace SeedboxSync.Core.Metadata;

/// <summary>The Movie Database. Accepts a v3 API key or a v4 read access token.</summary>
public sealed class TmdbProvider : IMetadataProvider
{
    private const string Api = "https://api.themoviedb.org/3";
    private const string Images = "https://image.tmdb.org/t/p/";
    private readonly HttpClient _http;
    private readonly SettingsStore _settings;

    public TmdbProvider(HttpClient http, SettingsStore settings)
    {
        _http = http;
        _settings = settings;
    }

    public string Name => "TMDB";

    private string Key => _settings.Current.Metadata.TmdbApiKey.Trim();

    public bool IsConfigured => Key.Length > 0;

    public bool Supports(MediaKind kind) => kind is MediaKind.Movie or MediaKind.Tv;

    public async Task<IReadOnlyList<MetadataCandidate>> SearchAsync(MediaKind kind, string query, int? year, CancellationToken ct)
    {
        var tv = kind == MediaKind.Tv;
        var url = $"{Api}/search/{(tv ? "tv" : "movie")}?query={Uri.EscapeDataString(query)}&include_adult=false";
        if (year != null) url += tv ? $"&first_air_date_year={year}" : $"&year={year}";
        using var doc = await GetAsync(url, ct);
        var list = doc.RootElement.Arr("results").Select(r => new MetadataCandidate(
            Name,
            r.Str("id") ?? "",
            (tv ? r.Str("name") : r.Str("title")) ?? "",
            J.YearOf(tv ? r.Str("first_air_date") : r.Str("release_date")),
            null,
            r.Str("poster_path") is { } p ? Images + "w185" + p : null,
            r.Dbl("popularity"))).ToList();

        // A year filter can hide the right result when the folder's year is off by one.
        if (list.Count == 0 && year != null) return await SearchAsync(kind, query, null, ct);
        return list;
    }

    public async Task<MetadataDetails> GetDetailsAsync(MediaKind kind, string id, CancellationToken ct)
    {
        if (kind == MediaKind.Tv) return await GetTvAsync(id, ct);
        using var doc = await GetAsync($"{Api}/movie/{Uri.EscapeDataString(id)}?append_to_response=credits", ct);
        var r = doc.RootElement;
        var directors = r.Prop("credits") is { } credits
            ? credits.Arr("crew").Where(c => c.Str("job") == "Director").Select(c => c.Str("name")).Where(n => n != null).Take(3).ToList()
            : new List<string?>();
        return new MetadataDetails(
            Name,
            id,
            r.Str("title") ?? "",
            J.YearOf(r.Str("release_date")),
            directors.Count > 0 ? string.Join(", ", directors) : null,
            r.Str("overview"),
            r.Int("runtime"),
            r.Str("poster_path") is { } p ? Images + "w500" + p : null,
            r.Str("backdrop_path") is { } b ? Images + "w1280" + b : null,
            r.Str("imdb_id"),
            id,
            r.Arr("genres").Select(g => g.Str("name")).Where(n => n != null).Select(n => n!).ToList(),
            Array.Empty<EpisodeInfo>(),
            r.Prop("belongs_to_collection")?.Str("id"),
            r.Prop("belongs_to_collection")?.Str("name"));
    }

    private async Task<MetadataDetails> GetTvAsync(string id, CancellationToken ct)
    {
        using var doc = await GetAsync($"{Api}/tv/{Uri.EscapeDataString(id)}?append_to_response=external_ids", ct);
        var r = doc.RootElement;
        var runtime = r.Arr("episode_run_time").Select(x => x.TryGetInt32(out var v) ? v : 0).FirstOrDefault(v => v > 0);
        var episodes = new List<EpisodeInfo>();
        foreach (var season in r.Arr("seasons").Select(s => s.Int("season_number") ?? 0).Where(n => n > 0).Take(40))
        {
            try
            {
                using var sdoc = await GetAsync($"{Api}/tv/{Uri.EscapeDataString(id)}/season/{season}", ct);
                foreach (var e in sdoc.RootElement.Arr("episodes"))
                {
                    var n = e.Int("episode_number");
                    if (n == null) continue;
                    episodes.Add(new EpisodeInfo(season, n.Value, e.Str("name") ?? $"Episode {n}", e.Int("runtime") ?? (runtime > 0 ? runtime : null), TvdbProvider.AirDate(e.Str("air_date"))));
                }
            }
            catch (HttpRequestException)
            {
                // A missing season should not fail the whole match.
            }
        }
        var networks = r.Arr("networks").Select(n => n.Str("name")).Where(n => n != null).Take(2).ToList();
        return new MetadataDetails(
            Name,
            id,
            r.Str("name") ?? "",
            J.YearOf(r.Str("first_air_date")),
            networks.Count > 0 ? string.Join(", ", networks) : null,
            r.Str("overview"),
            runtime > 0 ? runtime : null,
            r.Str("poster_path") is { } p ? Images + "w500" + p : null,
            r.Str("backdrop_path") is { } b ? Images + "w1280" + b : null,
            r.Prop("external_ids")?.Str("imdb_id"),
            id,
            r.Arr("genres").Select(g => g.Str("name")).Where(n => n != null).Select(n => n!).ToList(),
            episodes);
    }

    private async Task<JsonDocument> GetAsync(string url, CancellationToken ct)
    {
        var key = Key;
        if (key.Length == 0) throw new UserFacingException("Add a TMDB API key in Settings → Metadata providers.");
        var bearer = key.Length > 40;
        if (!bearer) url += (url.Contains('?') ? "&" : "?") + "api_key=" + Uri.EscapeDataString(key);
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        if (bearer) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        using var res = await _http.SendAsync(req, ct);
        if (res.StatusCode == HttpStatusCode.Unauthorized)
            throw new UserFacingException("TMDB rejected the API key. Check it in Settings → Metadata providers.");
        if (res.StatusCode == HttpStatusCode.NotFound)
            throw new UserFacingException("TMDB has no entry with that id.", 404);
        res.EnsureSuccessStatusCode();
        await using var s = await res.Content.ReadAsStreamAsync(ct);
        return await JsonDocument.ParseAsync(s, cancellationToken: ct);
    }
}
