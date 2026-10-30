using SeedboxSync.Core.Discover;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Transfers;
using SeedboxSync.Core.Common;

namespace SeedboxSync.Service.Endpoints;

/// <summary>
/// Where a Discover title stands: on the download list, on a media server, on the seedbox.
/// For a series on the download list that is in the library: its episodes not there yet,
/// released (<c>Waiting</c>), on the seedbox (<c>Ready</c>) and announced (<c>Upcoming</c>).
/// </summary>
public sealed record DiscoverStatus(bool Wanted, string? ServerId, string? ServerName, string? TitleKey, string? SeedboxPath,
    int Waiting = 0, int Ready = 0, int Upcoming = 0);

public sealed record DiscoverCard(DiscoverItem Item, DiscoverStatus Status);

public sealed record DiscoverPageDto(int Page, int TotalPages, int TotalResults, IReadOnlyList<DiscoverCard> Items);

public sealed record DiscoverDetailsDto(DiscoverDetails Details, DiscoverStatus Status, Ratings? Ratings, bool RatingsAvailable);

/// <summary>A season's episodes, and which of them you already have (episode numbers).</summary>
public sealed record DiscoverSeasonDto(DiscoverSeasonDetails Season, string? ServerName, IReadOnlyList<int> InLibrary, IReadOnlyList<int> OnSeedbox);

public sealed record PersonCreditDto(DiscoverItem Item, DiscoverStatus Status, string Role, string? Date);

public sealed record PersonDto(PersonDetails Person, IReadOnlyList<PersonCreditDto> Credits);

public sealed record WantedDto(WantedItem Item, DiscoverStatus Status);

public sealed record WantedRequest(
    MediaKind Kind, string? TmdbId, string Title, int? Year, string? PosterUrl,
    int? Season = null, int? Episode = null, string? EpisodeTitle = null, string? ServerId = null, string? TitleKey = null);

/// <summary>
/// Discover: browse TMDB (not part of the library), see where each title already is, and keep a
/// download list whose status follows the seedbox and the library.
/// </summary>
public static class DiscoverEndpoints
{
    public static void MapDiscoverEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/discover", async (string? kind, string? list, int? genre, int? year, double? minRating, string? sort, int? page, string? q,
            TmdbBrowser tmdb, LibraryService library, WantedList wanted, CancellationToken ct) =>
        {
            var k = Kind(kind);
            var result = string.IsNullOrWhiteSpace(q)
                ? await tmdb.ListAsync(k, list ?? "trending", genre, year, minRating, sort, page ?? 1, ct)
                : await tmdb.SearchAsync(k, q, page ?? 1, ct);
            var statuses = Statuses(result.Items.Select(i => (i.Kind, i.Id, i.Title, i.Year)).ToList(), library, wanted);
            return new DiscoverPageDto(result.Page, result.TotalPages, result.TotalResults,
                result.Items.Select(i => new DiscoverCard(i, statuses(i.Kind, i.Id))).ToList());
        });

        api.MapGet("/discover/genres", (string? kind, TmdbBrowser tmdb, CancellationToken ct) => tmdb.GenresAsync(Kind(kind), ct));

        // A person and everything they are in, with where each title already is.
        api.MapGet("/discover/person/{id}", async (string id, TmdbBrowser tmdb, LibraryService library, WantedList wanted, CancellationToken ct) =>
        {
            var p = await tmdb.PersonAsync(id, ct);
            var statuses = Statuses(p.Credits.Select(c => (c.Item.Kind, c.Item.Id, c.Item.Title, c.Item.Year)).ToList(), library, wanted);
            return new PersonDto(p with { Credits = Array.Empty<PersonCredit>() },
                p.Credits.Select(c => new PersonCreditDto(c.Item, statuses(c.Item.Kind, c.Item.Id), c.Role, c.Date)).ToList());
        });

        api.MapGet("/discover/{kind}/{id}", async (string kind, string id, TmdbBrowser tmdb, OmdbClient omdb, LibraryService library, WantedList wanted, CancellationToken ct) =>
        {
            var d = await tmdb.DetailsAsync(Kind(kind), id, ct);
            var status = Statuses(new[] { (d.Item.Kind, d.Item.Id, d.Item.Title, d.Item.Year) }, library, wanted)(d.Item.Kind, d.Item.Id);
            return new DiscoverDetailsDto(d, status, await omdb.GetAsync(d.ImdbId, ct), omdb.IsConfigured);
        });

        api.MapGet("/discover/tv/{id}/season/{number:int}", async (string id, int number, TmdbBrowser tmdb, LibraryService library, CancellationToken ct) =>
        {
            var season = await tmdb.SeasonAsync(id, number, ct);
            var inLibrary = new List<int>();
            var onSeedbox = new List<int>();
            string? serverName = null;
            // The library matches by TMDB id, so the title and year are not needed here.
            var p = library.FindPresence(new[] { (MediaKind.Tv, id, "", (int?)null) }).GetValueOrDefault("tv:" + id);
            if (p?.ServerId != null && p.TitleKey != null)
            {
                try
                {
                    var title = await library.GetTitleAsync(p.ServerId, p.TitleKey, ct);
                    var eps = title.Seasons.FirstOrDefault(s => s.Number == number)?.Episodes ?? Array.Empty<EpisodeDto>();
                    inLibrary.AddRange(eps.Where(e => e.Available).Select(e => e.Episode).Distinct());
                    onSeedbox.AddRange(eps.Where(e => !e.Available && e.OnSeedbox).Select(e => e.Episode).Distinct());
                    serverName = p.ServerName;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    // The server may be offline; the episode list is still useful without it.
                }
            }
            return new DiscoverSeasonDto(season, serverName, inLibrary, onSeedbox);
        });

        api.MapGet("/wanted", async (LibraryService library, MediaServerRegistry servers, TransferQueue transfers, WantedList wanted, CancellationToken ct) =>
        {
            var items = wanted.All;
            var titles = items.Where(i => !i.IsEpisode).ToList();
            var statuses = Statuses(titles.Select(i => (i.Kind, i.TmdbId, i.Title, i.Year)).ToList(), library, wanted);
            var episodes = await EpisodeStatusesAsync(items.Where(i => i.IsEpisode).ToList(), library, servers, ct);
            // Episodes already queued or downloading do not count as ready on the seedbox.
            var moving = transfers.Snapshot()
                .Where(t => t.Status is TransferStatus.Queued or TransferStatus.Active)
                .Select(t => t.ServerId + "|" + RelPath.Normalize(t.Path))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            var result = new List<WantedDto>();
            foreach (var i in items)
            {
                var st = i.IsEpisode ? episodes[i.Id] : statuses(i.Kind, i.TmdbId);
                if (!i.IsEpisode && i.Kind == MediaKind.Tv && st.ServerId != null && st.TitleKey != null)
                    st = await SeriesProgressAsync(st, library, moving, ct);
                result.Add(new WantedDto(i, st));
            }
            return result;
        });

        api.MapPost("/wanted", (WantedRequest req, WantedList wanted) =>
        {
            wanted.Add(new WantedItem
            {
                Kind = req.Kind,
                TmdbId = req.TmdbId ?? string.Empty,
                Title = req.Title,
                Year = req.Year,
                PosterUrl = req.PosterUrl,
                Season = req.Season,
                Episode = req.Episode,
                EpisodeTitle = req.EpisodeTitle,
                ServerId = req.ServerId,
                TitleKey = req.TitleKey,
            });
            return Results.NoContent();
        });

        // Any item by its id (as listed); used for episodes.
        api.MapDelete("/wanted", (string id, WantedList wanted) =>
        {
            wanted.Remove(id);
            return Results.NoContent();
        });

        api.MapDelete("/wanted/{kind}/{id}", (string kind, string id, WantedList wanted) =>
        {
            wanted.Remove(Kind(kind), id);
            return Results.NoContent();
        });

        // The TMDB entry for a library title (for its Details tab): the match's TMDB id, else found by IMDb / TVDB id.
        api.MapGet("/library/{serverId}/tmdb", async (string serverId, string key, LibraryService library, TmdbBrowser tmdb, CancellationToken ct) =>
        {
            var (kind, tmdbId, imdbId, tvdbId) = await library.ExternalIdsAsync(serverId, key, ct);
            if (kind is not (MediaKind.Movie or MediaKind.Tv)) return Results.Ok(new { kind = (string?)null, id = (string?)null });
            tmdbId ??= await tmdb.FindAsync(kind, imdbId, tvdbId, ct);
            return Results.Ok(new { kind = (string?)TmdbBrowser.Segment(kind), id = tmdbId });
        });

        // IMDb / Rotten Tomatoes / Metacritic for a library title (needs an OMDb key).
        api.MapGet("/library/{serverId}/ratings", async (string serverId, string key, LibraryService library, OmdbClient omdb, CancellationToken ct) =>
            new { available = omdb.IsConfigured, ratings = await omdb.GetAsync(await library.ImdbIdAsync(serverId, key, ct), ct) });
    }

    private static MediaKind Kind(string? kind) => kind?.ToLowerInvariant() is "tv" or "series" ? MediaKind.Tv : MediaKind.Movie;

    /// <summary>A series in the library: how many of its episodes are not there yet.</summary>
    private static async Task<DiscoverStatus> SeriesProgressAsync(DiscoverStatus st, LibraryService library, IReadOnlySet<string> moving, CancellationToken ct)
    {
        try
        {
            var eps = (await library.GetTitleAsync(st.ServerId!, st.TitleKey!, ct)).Seasons
                .SelectMany(s => s.Episodes)
                .Where(e => !e.Available && e.Episode < 900)
                .Where(e => e.SeedboxPath == null || !moving.Contains(st.ServerId + "|" + RelPath.Normalize(e.SeedboxPath)))
                .ToList();
            return st with
            {
                Ready = eps.Count(e => e.OnSeedbox),
                Upcoming = eps.Count(e => !e.OnSeedbox && e.Upcoming),
                Waiting = eps.Count(e => !e.OnSeedbox && !e.Upcoming),
            };
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return st;
        }
    }

    /// <summary>
    /// Episodes on the list: in the library when the episode file is on its server, on the seedbox
    /// when the seedbox has it. One library lookup per series.
    /// </summary>
    private static async Task<Dictionary<string, DiscoverStatus>> EpisodeStatusesAsync(IReadOnlyList<WantedItem> items, LibraryService library, MediaServerRegistry servers, CancellationToken ct)
    {
        var result = new Dictionary<string, DiscoverStatus>();
        foreach (var series in items.GroupBy(i => (i.ServerId!, i.TitleKey!)))
        {
            IReadOnlyList<SeasonDto> seasons = Array.Empty<SeasonDto>();
            var serverName = servers.Find(series.Key.Item1)?.Name;
            try
            {
                seasons = (await library.GetTitleAsync(series.Key.Item1, series.Key.Item2, ct)).Seasons;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Server offline or the title is gone: the episodes stay "wanted".
            }
            foreach (var i in series)
            {
                var e = seasons.FirstOrDefault(s => s.Number == i.Season)?.Episodes.FirstOrDefault(x => x.Episode == i.Episode);
                result[i.Id] = e?.Available == true
                    ? new DiscoverStatus(true, i.ServerId, serverName, i.TitleKey, e.SeedboxPath)
                    : new DiscoverStatus(true, null, null, i.TitleKey, e?.OnSeedbox == true ? e.SeedboxPath : null);
            }
        }
        return result;
    }

    private static Func<MediaKind, string, DiscoverStatus> Statuses(
        IReadOnlyList<(MediaKind Kind, string Id, string Title, int? Year)> items, LibraryService library, WantedList wanted)
    {
        var presence = library.FindPresence(items);
        return (kind, id) =>
        {
            presence.TryGetValue((kind == MediaKind.Tv ? "tv:" : "movie:") + id, out var p);
            return new DiscoverStatus(wanted.Contains(kind, id), p?.ServerId, p?.ServerName, p?.TitleKey, p?.SeedboxPath);
        };
    }
}
