using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Metadata;

namespace SeedboxSync.Core.Discover;

/// <summary>A movie or series from TMDB, as a card in Discover.</summary>
public sealed record DiscoverItem(
    MediaKind Kind,
    string Id,
    string Title,
    int? Year,
    string? Overview,
    string? PosterUrl,
    string? BackdropUrl,
    double? Rating,
    int Votes,
    IReadOnlyList<string> Genres);

public sealed record DiscoverPage(int Page, int TotalPages, int TotalResults, IReadOnlyList<DiscoverItem> Items);

public sealed record Genre(int Id, string Name);

/// <summary>A person in a title's credits; <c>Id</c> is their TMDB person id (for their page).</summary>
public sealed record CastMember(string Name, string? Character, string? Id = null);

/// <summary>A person's page: who they are, and everything they are credited in.</summary>
public sealed record PersonDetails(
    string Id,
    string Name,
    string? KnownFor,
    string? Birthday,
    string? Deathday,
    string? Birthplace,
    string? Biography,
    string? PhotoUrl,
    string? ImdbId,
    string TmdbUrl,
    IReadOnlyList<PersonCredit> Credits);

/// <summary>A title a person is credited in: the roles ("James Reece", "Executive Producer") and the full release date.</summary>
public sealed record PersonCredit(DiscoverItem Item, string Role, string? Date, double Popularity);

public sealed record DiscoverDetails(
    DiscoverItem Item,
    string? Tagline,
    int? RuntimeMinutes,
    int? Seasons,
    int? Episodes,
    string? Status,
    string? Credit,
    IReadOnlyList<CastMember> Cast,
    string? ImdbId,
    string? TrailerUrl,
    string? Network,
    string TmdbUrl,
    IReadOnlyList<DiscoverSeason>? SeasonList = null,
    DiscoverEpisode? NextEpisode = null,
    DiscoverEpisode? LastEpisode = null,
    IReadOnlyList<CastMember>? Makers = null);

/// <summary>A season of a series, as listed in its details.</summary>
public sealed record DiscoverSeason(int Number, string Name, int Episodes, string? Aired, string? PosterUrl);

/// <summary>An episode; <c>Aired</c> is the air date (yyyy-MM-dd), null when not announced.</summary>
public sealed record DiscoverEpisode(int Season, int Episode, string Title, string? Aired, int? RuntimeMinutes, string? Overview, string? StillUrl, double? Rating);

public sealed record DiscoverSeasonDetails(int Number, string Name, string? Overview, string? Aired, string? PosterUrl, IReadOnlyList<DiscoverEpisode> Episodes);

/// <summary>
/// Browsing TMDB: trending, popular, top rated, upcoming, by genre, and search. Separate from
/// matching (<see cref="TmdbProvider"/>); uses the same API key. Genre names are cached.
/// </summary>
public sealed class TmdbBrowser
{
    private const string Api = "https://api.themoviedb.org/3";
    private const string Images = "https://image.tmdb.org/t/p/";
    private readonly HttpClient _http;
    private readonly SettingsStore _settings;
    private readonly Dictionary<MediaKind, Dictionary<int, string>> _genres = new();
    private readonly SemaphoreSlim _genreLock = new(1, 1);
    private readonly System.Collections.Concurrent.ConcurrentDictionary<string, (DateTime At, object Value)> _cache = new();
    private static readonly TimeSpan CacheAge = TimeSpan.FromHours(6);

    public TmdbBrowser(HttpClient http, SettingsStore settings)
    {
        _http = http;
        _settings = settings;
    }

    public static string Segment(MediaKind kind) => kind == MediaKind.Tv ? "tv" : "movie";

    /// <summary>
    /// One page of a list. <paramref name="list"/>: trending, popular, top_rated, upcoming (movies) /
    /// on_the_air (series), now_playing (movies) / airing_today (series). Any genre, year, rating
    /// or sort switches to TMDB's discover endpoint with those filters.
    /// </summary>
    public async Task<DiscoverPage> ListAsync(MediaKind kind, string list, int? genre, int? year, double? minRating, string? sort, int page, CancellationToken ct)
    {
        var seg = Segment(kind);
        page = Math.Clamp(page, 1, 500);
        string url;
        if (genre != null || year != null || minRating != null || !string.IsNullOrEmpty(sort) || list == "discover")
        {
            var sortBy = sort switch
            {
                "rating" => "vote_average.desc",
                "newest" => kind == MediaKind.Tv ? "first_air_date.desc" : "primary_release_date.desc",
                "votes" => "vote_count.desc",
                _ => "popularity.desc",
            };
            url = $"{Api}/discover/{seg}?include_adult=false&sort_by={sortBy}&page={page}";
            // Rating sorts are meaningless with a handful of votes.
            url += $"&vote_count.gte={(sort is "rating" ? 300 : minRating != null ? 100 : 10)}";
            if (genre != null) url += $"&with_genres={genre}";
            if (year != null) url += kind == MediaKind.Tv ? $"&first_air_date_year={year}" : $"&primary_release_year={year}";
            if (minRating != null) url += $"&vote_average.gte={minRating.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)}";
            // "Newest" should not list things that have not come out yet.
            if (sort == "newest") url += kind == MediaKind.Tv ? $"&first_air_date.lte={DateTime.UtcNow:yyyy-MM-dd}" : $"&primary_release_date.lte={DateTime.UtcNow:yyyy-MM-dd}";
        }
        else
        {
            var path = (list, kind) switch
            {
                ("trending", _) => $"trending/{seg}/week",
                ("top_rated", _) => $"{seg}/top_rated",
                ("upcoming", MediaKind.Movie) or ("on_the_air", MediaKind.Movie) => "movie/upcoming",
                ("upcoming", _) or ("on_the_air", _) => "tv/on_the_air",
                ("now_playing", MediaKind.Movie) or ("airing_today", MediaKind.Movie) => "movie/now_playing",
                ("now_playing", _) or ("airing_today", _) => "tv/airing_today",
                _ => $"{seg}/popular",
            };
            url = $"{Api}/{path}?page={page}";
        }
        return await PageAsync(kind, url, ct);
    }

    public async Task<DiscoverPage> SearchAsync(MediaKind kind, string query, int page, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(query)) return new DiscoverPage(1, 0, 0, Array.Empty<DiscoverItem>());
        var url = $"{Api}/search/{Segment(kind)}?include_adult=false&query={Uri.EscapeDataString(query.Trim())}&page={Math.Clamp(page, 1, 500)}";
        return await PageAsync(kind, url, ct);
    }

    public async Task<IReadOnlyList<Genre>> GenresAsync(MediaKind kind, CancellationToken ct)
    {
        var map = await GenreMapAsync(kind, ct);
        return map.Select(kv => new Genre(kv.Key, kv.Value)).OrderBy(g => g.Name).ToList();
    }

    public async Task<DiscoverDetails> DetailsAsync(MediaKind kind, string id, CancellationToken ct)
    {
        var tv = kind == MediaKind.Tv;
        using var doc = await GetAsync($"{Api}/{Segment(kind)}/{Uri.EscapeDataString(id)}?append_to_response=external_ids,videos,credits", ct);
        var r = doc.RootElement;
        var genres = r.Arr("genres").Select(g => g.Str("name")).Where(n => n != null).Select(n => n!).ToList();
        var item = new DiscoverItem(
            kind,
            id,
            (tv ? r.Str("name") : r.Str("title")) ?? "",
            J.YearOf(tv ? r.Str("first_air_date") : r.Str("release_date")),
            r.Str("overview"),
            r.Str("poster_path") is { } p ? Images + "w500" + p : null,
            r.Str("backdrop_path") is { } b ? Images + "w1280" + b : null,
            r.Dbl("vote_average") is { } v && v > 0 ? Math.Round(v, 1) : null,
            r.Int("vote_count") ?? 0,
            genres);
        var credits = r.Prop("credits");
        var cast = credits?.Arr("cast").Take(8).Select(c => new CastMember(c.Str("name") ?? "", c.Str("character"), c.Str("id"))).Where(c => c.Name.Length > 0).ToList()
            ?? new List<CastMember>();
        // Directors (movies) or creators (series), with ids so they can be opened too.
        var makers = (tv
                ? r.Arr("created_by").Select(c => new CastMember(c.Str("name") ?? "", "Creator", c.Str("id")))
                : credits?.Arr("crew").Where(c => c.Str("job") == "Director").Select(c => new CastMember(c.Str("name") ?? "", "Director", c.Str("id"))) ?? Enumerable.Empty<CastMember>())
            .Where(c => c.Name.Length > 0).Take(3).ToList();
        string? credit = tv
            ? string.Join(", ", r.Arr("created_by").Select(c => c.Str("name")).Where(n => n != null).Take(3))
            : string.Join(", ", credits?.Arr("crew").Where(c => c.Str("job") == "Director").Select(c => c.Str("name")).Where(n => n != null).Take(3) ?? Array.Empty<string?>());
        // The first official YouTube trailer, else any YouTube trailer or teaser.
        var videos = r.Prop("videos")?.Arr("results").Where(v => v.Str("site") == "YouTube" && v.Str("key") != null).ToList() ?? new List<JsonElement>();
        var trailer = videos.FirstOrDefault(v => v.Str("type") == "Trailer" && v.Prop("official")?.ValueKind == JsonValueKind.True);
        if (trailer.ValueKind != JsonValueKind.Object) trailer = videos.FirstOrDefault(v => v.Str("type") is "Trailer" or "Teaser");
        var runtime = tv ? r.Arr("episode_run_time").Select(x => x.TryGetInt32(out var n) ? n : 0).FirstOrDefault(n => n > 0) : r.Int("runtime") ?? 0;
        var network = tv ? r.Arr("networks").Select(n => n.Str("name")).FirstOrDefault(n => n != null) : null;
        // Seasons with episodes, specials last.
        var seasons = tv
            ? r.Arr("seasons")
                .Where(x => x.Int("season_number") != null && (x.Int("episode_count") ?? 0) > 0)
                .Select(x => new DiscoverSeason(
                    x.Int("season_number")!.Value,
                    x.Str("name") ?? $"Season {x.Int("season_number")}",
                    x.Int("episode_count") ?? 0,
                    Date(x.Str("air_date")),
                    x.Str("poster_path") is { } sp ? Images + "w185" + sp : null))
                .OrderBy(x => x.Number == 0 ? int.MaxValue : x.Number)
                .ToList()
            : null;
        return new DiscoverDetails(
            item,
            string.IsNullOrWhiteSpace(r.Str("tagline")) ? null : r.Str("tagline"),
            runtime > 0 ? runtime : null,
            tv ? r.Int("number_of_seasons") : null,
            tv ? r.Int("number_of_episodes") : null,
            r.Str("status"),
            string.IsNullOrEmpty(credit) ? null : credit,
            cast,
            r.Prop("external_ids")?.Str("imdb_id") ?? r.Str("imdb_id"),
            trailer.ValueKind == JsonValueKind.Object ? "https://www.youtube.com/watch?v=" + trailer.Str("key") : null,
            network,
            $"https://www.themoviedb.org/{Segment(kind)}/{id}",
            seasons,
            tv && r.Prop("next_episode_to_air") is { ValueKind: JsonValueKind.Object } next ? Episode(next) : null,
            tv && r.Prop("last_episode_to_air") is { ValueKind: JsonValueKind.Object } last ? Episode(last) : null,
            makers);
    }

    /// <summary>
    /// A person and everything they are credited in, movies and series, acting and crew, one entry
    /// per title (roles joined). Talk shows, news and appearances as themselves are left out.
    /// </summary>
    public async Task<PersonDetails> PersonAsync(string id, CancellationToken ct)
    {
        var movieGenres = await GenreMapAsync(MediaKind.Movie, ct);
        var tvGenres = await GenreMapAsync(MediaKind.Tv, ct);
        using var doc = await GetAsync($"{Api}/person/{Uri.EscapeDataString(id)}?append_to_response=combined_credits", ct);
        var r = doc.RootElement;
        var credits = r.Prop("combined_credits");
        var rows = (credits?.Arr("cast").Select(c => (c, Role: c.Str("character"), Cast: true)) ?? Enumerable.Empty<(JsonElement, string?, bool)>())
            .Concat(credits?.Arr("crew").Select(c => (c, Role: c.Str("job"), Cast: false)) ?? Enumerable.Empty<(JsonElement, string?, bool)>());
        var byTitle = new Dictionary<string, (JsonElement E, MediaKind Kind, List<string> Roles)>();
        foreach (var (c, role, isCast) in rows)
        {
            var kind = c.Str("media_type") switch { "movie" => MediaKind.Movie, "tv" => MediaKind.Tv, _ => (MediaKind?)null };
            var tid = c.Str("id");
            if (kind == null || tid == null) continue;
            var genreIds = c.Arr("genre_ids").Select(g => g.TryGetInt32(out var n) ? n : 0).ToList();
            // 10767 Talk, 10763 News; "Self" / "Himself" / "Herself" are appearances, not roles.
            if (genreIds.Contains(10767) || genreIds.Contains(10763)) continue;
            if (isCast && role != null && System.Text.RegularExpressions.Regex.IsMatch(role, @"^(self|himself|herself|themselves)\b", System.Text.RegularExpressions.RegexOptions.IgnoreCase)) continue;
            var key = $"{kind}:{tid}";
            if (!byTitle.TryGetValue(key, out var entry)) byTitle[key] = entry = (c, kind.Value, new List<string>());
            var label = string.IsNullOrWhiteSpace(role) ? (isCast ? "Cast" : "Crew") : role.Trim();
            if (!entry.Roles.Contains(label, StringComparer.OrdinalIgnoreCase)) entry.Roles.Add(label);
        }
        var list = byTitle.Values.Select(x =>
        {
            var (e, kind, roles) = x;
            var tv = kind == MediaKind.Tv;
            var genres = tv ? tvGenres : movieGenres;
            var date = Date(tv ? e.Str("first_air_date") : e.Str("release_date"));
            var item = new DiscoverItem(
                kind,
                e.Str("id")!,
                (tv ? e.Str("name") : e.Str("title")) ?? "",
                J.YearOf(date),
                e.Str("overview"),
                e.Str("poster_path") is { } p ? Images + "w342" + p : null,
                e.Str("backdrop_path") is { } b ? Images + "w780" + b : null,
                e.Dbl("vote_average") is var v && v > 0 && (e.Int("vote_count") ?? 0) > 0 ? (double?)Math.Round(v, 1) : null,
                e.Int("vote_count") ?? 0,
                e.Arr("genre_ids").Select(g => g.TryGetInt32(out var gid) && genres.TryGetValue(gid, out var n) ? n : null).Where(n => n != null).Select(n => n!).ToList());
            return new PersonCredit(item, string.Join(", ", roles.Take(3)), date, e.Dbl("popularity"));
        })
        .Where(c => c.Item.Title.Length > 0)
        // Popular first; titles nobody voted on (often unreleased or obscure) last.
        .OrderByDescending(c => c.Item.Votes > 0)
        .ThenByDescending(c => c.Popularity)
        .ToList();
        return new PersonDetails(
            id,
            r.Str("name") ?? "",
            r.Str("known_for_department"),
            Date(r.Str("birthday")),
            Date(r.Str("deathday")),
            r.Str("place_of_birth"),
            string.IsNullOrWhiteSpace(r.Str("biography")) ? null : r.Str("biography"),
            r.Str("profile_path") is { } pp ? Images + "w185" + pp : null,
            r.Str("imdb_id"),
            $"https://www.themoviedb.org/person/{id}",
            list);
    }

    /// <summary>The episodes of one season, with air dates (null when TMDB has none yet).</summary>
    public async Task<DiscoverSeasonDetails> SeasonAsync(string id, int season, CancellationToken ct)
    {
        using var doc = await GetAsync($"{Api}/tv/{Uri.EscapeDataString(id)}/season/{season}", ct);
        var r = doc.RootElement;
        return new DiscoverSeasonDetails(
            season,
            r.Str("name") ?? $"Season {season}",
            string.IsNullOrWhiteSpace(r.Str("overview")) ? null : r.Str("overview"),
            Date(r.Str("air_date")),
            r.Str("poster_path") is { } p ? Images + "w342" + p : null,
            r.Arr("episodes").Where(e => e.Int("episode_number") != null).Select(Episode).OrderBy(e => e.Episode).ToList());
    }

    /// <summary>
    /// The TMDB id of a movie or series known by its IMDb id ("tt…") or TVDB id, via TMDB's find.
    /// Cached; null when TMDB does not know it.
    /// </summary>
    public async Task<string?> FindAsync(MediaKind kind, string? imdbId, string? tvdbId, CancellationToken ct)
    {
        foreach (var (id, source) in new[] { (imdbId, "imdb_id"), (tvdbId, "tvdb_id") })
        {
            if (string.IsNullOrWhiteSpace(id)) continue;
            var hit = await CachedAsync($"find:{source}:{id}", async () =>
            {
                using var doc = await GetAsync($"{Api}/find/{Uri.EscapeDataString(id)}?external_source={source}", ct);
                var results = doc.RootElement.Arr(kind == MediaKind.Tv ? "tv_results" : "movie_results");
                return new[] { results.Select(r => r.Str("id")).FirstOrDefault(x => x != null) ?? "" };
            });
            if (hit[0].Length > 0) return hit[0];
        }
        return null;
    }

    /// <summary>Series details, cached for 6 hours (for the release calendar).</summary>
    public Task<DiscoverDetails> CachedDetailsAsync(string id, CancellationToken ct) =>
        CachedAsync($"tv:{id}", () => DetailsAsync(MediaKind.Tv, id, ct));

    /// <summary>A season's episodes, cached for 6 hours (for the release calendar).</summary>
    public Task<DiscoverSeasonDetails> CachedSeasonAsync(string id, int season, CancellationToken ct) =>
        CachedAsync($"tv:{id}:{season}", () => SeasonAsync(id, season, ct));

    private async Task<T> CachedAsync<T>(string key, Func<Task<T>> load) where T : class
    {
        if (_cache.TryGetValue(key, out var hit) && DateTime.UtcNow - hit.At < CacheAge && hit.Value is T value) return value;
        var fresh = await load();
        _cache[key] = (DateTime.UtcNow, fresh);
        return fresh;
    }

    private static DiscoverEpisode Episode(JsonElement e) => new(
        e.Int("season_number") ?? 0,
        e.Int("episode_number") ?? 0,
        e.Str("name") ?? $"Episode {e.Int("episode_number")}",
        Date(e.Str("air_date")),
        e.Int("runtime") is int rt && rt > 0 ? rt : (int?)null,
        string.IsNullOrWhiteSpace(e.Str("overview")) ? null : e.Str("overview"),
        e.Str("still_path") is { } sp ? Images + "w300" + sp : null,
        e.Dbl("vote_average") is var v && v > 0 && (e.Int("vote_count") ?? 0) > 0 ? (double?)Math.Round(v, 1) : null);

    /// <summary>TMDB dates are yyyy-MM-dd, sometimes empty.</summary>
    private static string? Date(string? s) => DateOnly.TryParseExact(s, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var d)
        ? d.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture)
        : null;

    private async Task<DiscoverPage> PageAsync(MediaKind kind, string url, CancellationToken ct)
    {
        var genres = await GenreMapAsync(kind, ct);
        using var doc = await GetAsync(url, ct);
        var root = doc.RootElement;
        var tv = kind == MediaKind.Tv;
        var items = root.Arr("results")
            .Where(r => r.Str("id") != null)
            .Select(r => new DiscoverItem(
                kind,
                r.Str("id")!,
                (tv ? r.Str("name") : r.Str("title")) ?? "",
                J.YearOf(tv ? r.Str("first_air_date") : r.Str("release_date")),
                r.Str("overview"),
                r.Str("poster_path") is { } p ? Images + "w342" + p : null,
                r.Str("backdrop_path") is { } b ? Images + "w780" + b : null,
                r.Dbl("vote_average") is { } v && v > 0 ? Math.Round(v, 1) : null,
                r.Int("vote_count") ?? 0,
                r.Arr("genre_ids").Select(g => g.TryGetInt32(out var gid) && genres.TryGetValue(gid, out var n) ? n : null).Where(n => n != null).Select(n => n!).ToList()))
            .ToList();
        return new DiscoverPage(root.Int("page") ?? 1, Math.Min(root.Int("total_pages") ?? 1, 500), root.Int("total_results") ?? items.Count, items);
    }

    private async Task<Dictionary<int, string>> GenreMapAsync(MediaKind kind, CancellationToken ct)
    {
        if (_genres.TryGetValue(kind, out var cached)) return cached;
        await _genreLock.WaitAsync(ct);
        try
        {
            if (_genres.TryGetValue(kind, out cached)) return cached;
            using var doc = await GetAsync($"{Api}/genre/{Segment(kind)}/list", ct);
            var map = new Dictionary<int, string>();
            foreach (var g in doc.RootElement.Arr("genres"))
                if (g.Int("id") is { } id && g.Str("name") is { } name) map[id] = name;
            _genres[kind] = map;
            return map;
        }
        finally
        {
            _genreLock.Release();
        }
    }

    private async Task<JsonDocument> GetAsync(string url, CancellationToken ct)
    {
        var key = _settings.Current.Metadata.TmdbApiKey.Trim();
        if (key.Length == 0) throw new UserFacingException("Discover uses TMDB. Add a TMDB API key in Settings → Metadata providers.");
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
        if ((int)res.StatusCode == 429)
            throw new UserFacingException("TMDB is rate limiting requests. Try again in a few seconds.", 503);
        res.EnsureSuccessStatusCode();
        await using var s = await res.Content.ReadAsStreamAsync(ct);
        return await JsonDocument.ParseAsync(s, cancellationToken: ct);
    }
}
