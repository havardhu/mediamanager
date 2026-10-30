using SeedboxSync.Core.Discover;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Service.Endpoints;

/// <summary>
/// One episode on the release calendar: from a series in the library (<c>TitleKey</c> set), or
/// from a series on the download list that is not in the library yet (<c>WantedId</c> set).
/// </summary>
public sealed record CalendarEntry(
    string Date,
    string Series,
    int Season,
    int Episode,
    string Title,
    string? TitleKey,
    bool HasPoster,
    string? WantedId,
    string? TmdbId,
    string? PosterUrl,
    bool Available,
    bool OnSeedbox,
    bool Wanted);

/// <summary>The release calendar: episodes of series in the library and on the download list.</summary>
public static class CalendarEndpoints
{
    public static void MapCalendarEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/library/{serverId}/calendar", async (string serverId, string from, string to,
            LibraryService library, WantedList wanted, TmdbBrowser tmdb, ILoggerFactory logs, CancellationToken ct) =>
        {
            var inv = System.Globalization.CultureInfo.InvariantCulture;
            var none = System.Globalization.DateTimeStyles.None;
            if (!DateOnly.TryParseExact(from, "yyyy-MM-dd", inv, none, out var f)
                || !DateOnly.TryParseExact(to, "yyyy-MM-dd", inv, none, out var t) || t < f || t.DayNumber - f.DayNumber > 120)
                return Results.BadRequest(new { message = "Give from and to as yyyy-MM-dd, at most 120 days apart." });
            var fromS = f.ToString("yyyy-MM-dd", inv);
            var toS = t.ToString("yyyy-MM-dd", inv);

            var items = wanted.All;
            // Whole series on the list (in this library), and single episodes on the list.
            var wantedKeys = items.Where(i => !i.IsEpisode && i.Kind == MediaKind.Tv).Select(i => i.TmdbId).ToHashSet();
            var wantedEps = items.Where(i => i.IsEpisode && i.ServerId == serverId).Select(i => $"{i.TitleKey}|{i.Season}|{i.Episode}").ToHashSet(StringComparer.OrdinalIgnoreCase);

            var result = new List<CalendarEntry>();
            var inLibrary = new HashSet<string>();
            foreach (var c in await library.CalendarAsync(serverId, fromS, toS, ct))
            {
                if (c.TmdbId != null) inLibrary.Add(c.TmdbId);
                var isWanted = !c.Available && ((c.TmdbId != null && wantedKeys.Contains(c.TmdbId)) || wantedEps.Contains($"{c.TitleKey}|{c.Season}|{c.Episode}"));
                result.Add(new CalendarEntry(c.Date, c.Series, c.Season, c.Episode, c.Title, c.TitleKey, c.HasPoster, null, c.TmdbId, null, c.Available, c.OnSeedbox, isWanted));
            }

            // Series on the download list that are not in this library: their airing seasons from TMDB.
            var presence = library.FindPresence(items.Where(i => !i.IsEpisode && i.Kind == MediaKind.Tv).Select(i => (i.Kind, i.TmdbId, i.Title, i.Year)).ToList());
            foreach (var w in items.Where(i => !i.IsEpisode && i.Kind == MediaKind.Tv && !inLibrary.Contains(i.TmdbId)))
            {
                // In the library (on this server) but with nothing airing in range: nothing to add.
                if (presence.TryGetValue("tv:" + w.TmdbId, out var p) && p.ServerId == serverId) continue;
                try
                {
                    var d = await tmdb.CachedDetailsAsync(w.TmdbId, ct);
                    var seasons = new[] { d.LastEpisode?.Season, d.NextEpisode?.Season }.Where(s => s is > 0).Select(s => s!.Value).Distinct();
                    foreach (var n in seasons)
                    {
                        var season = await tmdb.CachedSeasonAsync(w.TmdbId, n, ct);
                        foreach (var e in season.Episodes.Where(e => e.Aired != null && string.CompareOrdinal(e.Aired, fromS) >= 0 && string.CompareOrdinal(e.Aired, toS) <= 0))
                            result.Add(new CalendarEntry(e.Aired!, d.Item.Title, e.Season, e.Episode, e.Title, null, false, w.Id, w.TmdbId,
                                w.PosterUrl ?? d.Item.PosterUrl, false, false, true));
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    // No TMDB key, rate limited or offline: leave this series out for now.
                    logs.CreateLogger("Calendar").LogDebug(ex, "No calendar data for {Title}", w.Title);
                }
            }
            return Results.Ok(result.OrderBy(e => e.Date, StringComparer.Ordinal).ThenBy(e => e.Series).ThenBy(e => e.Season).ThenBy(e => e.Episode).ToList());
        });
    }
}
