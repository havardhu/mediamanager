using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Metadata;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Core.Library;

/// <summary>
/// The "what to watch" layer on top of the library: up next and continue watching (from
/// <see cref="WatchHistory"/>), new and missing episodes (from the provider's episode list with
/// air dates), recently added, duplicates and TMDB collections. A background job keeps episode
/// lists fresh, so a newly released episode shows up within hours.
/// </summary>
public sealed partial class LibraryService
{
    private static readonly TimeSpan EpisodeRefreshAge = TimeSpan.FromHours(12);

    private static string Today => DateTime.UtcNow.ToString("yyyy-MM-dd");

    private static bool HasAired(string? aired) => aired != null && string.CompareOrdinal(aired, Today) <= 0;

    /// <summary>
    /// "New" means released recently (30 days), so downloading the first episodes of an old
    /// season does not flag the rest as new.
    /// </summary>
    private static bool Recent(string? aired) =>
        HasAired(aired) && string.CompareOrdinal(aired, DateTime.UtcNow.AddDays(-30).ToString("yyyy-MM-dd")) >= 0;

    // ---- Playing and watched ----------------------------------------------------------------

    /// <summary>Called when a file is opened with Play: remembers it for "Up next".</summary>
    public void RecordPlayed(string serverId, string path)
    {
        var safe = RelPath.LocalSafe(RelPath.Normalize(path));
        var key = TitleKeyFor(serverId, safe);
        if (key != null) _history.Played(serverId, key, safe);
    }

    public async Task SetWatchedAsync(string serverId, string key, IReadOnlyList<string> paths, bool watched, CancellationToken ct)
    {
        var (g, _) = await FindAsync(serverId, key, ct);
        var safe = paths.Select(p => RelPath.LocalSafe(RelPath.Normalize(p))).ToList();
        _history.SetWatched(serverId, g.Key, safe, watched);
    }

    /// <summary>
    /// The file Play should open for a title: a movie's main file, or for a series the next
    /// episode after the last one played (the first one if none was played yet).
    /// </summary>
    public async Task<string?> PlayTargetAsync(string serverId, string key, CancellationToken ct)
    {
        var (g, meta) = await FindAsync(serverId, key, ct);
        if (g.Kind != MediaKind.Tv) return ToDto(g, meta).MainFile;
        var seasons = Episodes(serverId, g, meta);
        var all = seasons.SelectMany(s => s.Episodes).ToList();
        var next = UpNext(all, _history.Get(serverId, g.Key));
        return next is { Available: true } ? next.Path : all.FirstOrDefault(e => e.Available)?.Path;
    }

    // ---- Enrichment -------------------------------------------------------------------------

    /// <summary>
    /// Episodes on disk and on the seedbox, plus released episodes that are on neither (from the
    /// provider), each marked watched / new / missing.
    /// </summary>
    private List<SeasonDto> Episodes(string serverId, TitleGroup g, TitleMeta? meta)
    {
        var seasons = BuildEpisodes(g, meta);
        var history = _history.Get(serverId, g.Key);
        var byNumber = seasons.SelectMany(s => s.Episodes).ToDictionary(e => (e.Season, e.Episode));
        // Providers occasionally list an episode twice; the first entry wins.
        var aired = (meta?.Episodes ?? new List<EpisodeInfo>()).GroupBy(e => (e.Season, e.Episode)).ToDictionary(x => x.Key, x => x.First().Aired);

        // Episodes that are on neither this server nor the seedbox: released ones, and upcoming
        // ones (with a date, or undated in a season that has dates, i.e. announced).
        var datedSeasons = (meta?.Episodes ?? new List<EpisodeInfo>()).Where(e => e.Aired != null).Select(e => e.Season).ToHashSet();
        foreach (var info in meta?.Episodes ?? new List<EpisodeInfo>())
        {
            if (info.Season <= 0 || byNumber.ContainsKey((info.Season, info.Episode))) continue;
            if (info.Aired == null && !datedSeasons.Contains(info.Season)) continue;
            byNumber[(info.Season, info.Episode)] = new EpisodeDto(
                $"{g.Key}#S{info.Season:00}E{info.Episode:00}", info.Season, info.Episode, info.Title, info.RuntimeMinutes ?? meta?.RuntimeMinutes,
                0, null, null, false, false, Array.Empty<SubtitleTrackDto>());
        }

        var newest = byNumber.Values.Where(e => e.Available && e.Episode < 900).Select(e => (e.Season, e.Episode)).DefaultIfEmpty((0, 0)).Max();
        var list = byNumber.Values.Select(e =>
        {
            var air = aired.TryGetValue((e.Season, e.Episode), out var a) ? a : null;
            var released = air == null ? e.OnSeedbox : HasAired(air);
            var after = Compare((e.Season, e.Episode), newest) > 0;
            return e with
            {
                Watched = e.Path != null && history?.Watched.Contains(e.Path) == true,
                Aired = air,
                New = !e.Available && Recent(air) && e.Episode < 900 && newest != (0, 0) && after,
                Missing = !e.Available && released && e.Episode < 900 && !after,
                Upcoming = !e.Available && !e.OnSeedbox && e.Path == null && !HasAired(air),
            };
        });
        return list.GroupBy(e => e.Season).OrderBy(x => x.Key)
            .Select(x => new SeasonDto(x.Key, x.OrderBy(e => e.Episode).ToList()))
            .ToList();
    }

    private static int Compare((int S, int E) a, (int S, int E) b) => a.S != b.S ? a.S.CompareTo(b.S) : a.E.CompareTo(b.E);

    /// <summary>
    /// The episode after where you are: the furthest of the last one played and the highest one
    /// marked watched. Null when nothing was watched yet or you are caught up.
    /// </summary>
    private static EpisodeDto? UpNext(List<EpisodeDto> all, WatchHistory.Entry? history)
    {
        if (history == null) return null;
        var ordered = all.Where(e => e.Episode < 900).OrderBy(e => e.Season).ThenBy(e => e.Episode).ToList();
        var lastPlayed = history.LastPath == null ? -1 : ordered.FindIndex(e => e.Path != null && RelPath.Comparer.Equals(e.Path, history.LastPath));
        var lastWatched = ordered.FindLastIndex(e => e.Path != null && history.Watched.Contains(e.Path));
        var last = Math.Max(lastPlayed, lastWatched);
        if (last < 0) return null;
        return ordered.Skip(last + 1).FirstOrDefault(e => e.Available || e.OnSeedbox || e.New || e.Missing);
    }

    private static EpisodeRefDto Ref(EpisodeDto e) =>
        new(e.Key, e.Path, e.Season, e.Episode, e.Title, e.Available, e.OnSeedbox, e.SeedboxPath, e.Aired);

    /// <summary>Adds up next, new episodes, recently added, collection and duplicates to the titles.</summary>
    private List<TitleDto> Enrich(string serverId, IReadOnlyList<(TitleGroup G, TitleMeta? Meta, TitleDto Dto)> titles)
    {
        // The same movie matched more than once (two releases, or in a pack and on its own).
        var duplicates = titles
            .Where(t => t.G.Kind == MediaKind.Movie && t.Meta is { Status: not MatchStatus.Unmatched } m && m.ProviderId.Length > 0)
            .GroupBy(t => t.Meta!.Provider + ":" + t.Meta!.ProviderId)
            .Where(x => x.Count() > 1)
            .SelectMany(x => x.Select(t => (t.G.Key, Others: (IReadOnlyList<string>)x.Where(o => o.G.Key != t.G.Key).Select(o => o.G.Key).ToList())))
            .ToDictionary(x => x.Key, x => x.Others, StringComparer.OrdinalIgnoreCase);

        var result = new List<TitleDto>();
        foreach (var (g, meta, dto) in titles)
        {
            var history = _history.Get(serverId, g.Key);
            var added = MediaFiles(g).Select(f => (DateTime?)f.ModifiedUtc).DefaultIfEmpty(null).Max();
            var t = dto with
            {
                AddedUtc = added,
                LastPlayedUtc = history?.LastPlayedUtc is { } lp && lp > DateTime.MinValue ? lp : null,
                CollectionId = meta?.CollectionId,
                Collection = meta?.CollectionName,
                Duplicates = duplicates.TryGetValue(g.Key, out var d) ? d : null,
            };
            if (g.Kind == MediaKind.Tv)
            {
                var all = Episodes(serverId, g, meta).SelectMany(s => s.Episodes).ToList();
                var next = UpNext(all, history);
                var upcoming = meta?.Episodes.Where(e => e.Season > 0 && e.Aired != null && !HasAired(e.Aired))
                    .OrderBy(e => e.Aired, StringComparer.Ordinal).FirstOrDefault();
                t = t with
                {
                    UpNext = next == null ? null : Ref(next),
                    NewEpisodes = all.Where(e => e.New).Select(Ref).ToList(),
                    Missing = all.Count(e => e.Missing),
                    NextAirs = upcoming == null ? null : $"S{upcoming.Season:00}E{upcoming.Episode:00} · {upcoming.Aired}",
                };
            }
            result.Add(t);
        }
        return result;
    }

    // ---- Release calendar ---------------------------------------------------------------------

    /// <summary>An episode of a series in the library, airing (or aired) on <c>Date</c>.</summary>
    public sealed record CalendarItem(string Date, string TitleKey, string Series, bool HasPoster, string? TmdbId,
        int Season, int Episode, string Title, bool Available, bool OnSeedbox);

    /// <summary>Episodes of the series on a server with an air date from <paramref name="from"/> to <paramref name="to"/> (yyyy-MM-dd, inclusive).</summary>
    public async Task<IReadOnlyList<CalendarItem>> CalendarAsync(string serverId, string from, string to, CancellationToken ct)
    {
        var inv = await _inventory.GetOrLastKnownAsync(serverId, ct);
        var index = _index.All(serverId);
        var list = new List<CalendarItem>();
        foreach (var g in BuildGroups(inv, _catalog.State).Values.Where(g => g.Kind == MediaKind.Tv && MediaFiles(g).Count > 0))
        {
            if (!index.TryGetValue(g.Key, out var meta) || meta.Status == MatchStatus.Unmatched) continue;
            var inRange = meta.Episodes
                .Where(e => e.Season > 0 && e.Aired != null && string.CompareOrdinal(e.Aired, from) >= 0 && string.CompareOrdinal(e.Aired, to) <= 0)
                .GroupBy(e => (e.Season, e.Episode)).Select(x => x.First())
                .ToList();
            if (inRange.Count == 0) continue;
            var have = Episodes(serverId, g, meta).SelectMany(s => s.Episodes).GroupBy(e => (e.Season, e.Episode)).ToDictionary(x => x.Key, x => x.First());
            var dto = ToDto(g, meta);
            var tmdb = meta.Provider == "TMDB" ? meta.ProviderId : meta.TmdbId;
            foreach (var e in inRange)
            {
                have.TryGetValue((e.Season, e.Episode), out var h);
                list.Add(new CalendarItem(e.Aired!, g.Key, dto.DisplayTitle, dto.HasPoster, string.IsNullOrEmpty(tmdb) ? null : tmdb,
                    e.Season, e.Episode, e.Title, h?.Available == true, h?.OnSeedbox == true));
            }
        }
        return list;
    }

    // ---- Presence (for Discover) --------------------------------------------------------------

    /// <summary>Where a TMDB title already is: a media server (matched to that id) and/or the seedbox.</summary>
    public sealed record Presence(string? ServerId, string? ServerName, string? TitleKey, string? SeedboxPath);

    /// <summary>
    /// For TMDB titles: the media server that has each one (a title matched to the same TMDB id),
    /// and a seedbox folder with the same name and year. Keyed by "movie:603" / "tv:1399".
    /// </summary>
    public Dictionary<string, Presence> FindPresence(IReadOnlyList<(MediaKind Kind, string TmdbId, string Title, int? Year)> items)
    {
        static string Id(MediaKind kind, string tmdbId) => (kind == MediaKind.Tv ? "tv:" : "movie:") + tmdbId;

        var library = new Dictionary<string, (string ServerId, string ServerName, string Key)>();
        foreach (var server in _servers.All)
        {
            var inv = _inventory.Peek(server.Id);
            if (inv == null) continue;
            var index = _index.All(server.Id);
            foreach (var g in BuildGroups(inv, _catalog.State).Values.Where(g => MediaFiles(g).Count > 0))
            {
                if (!index.TryGetValue(g.Key, out var m) || m.Status == MatchStatus.Unmatched) continue;
                var tmdb = m.Provider == "TMDB" ? m.ProviderId : m.TmdbId;
                if (!string.IsNullOrEmpty(tmdb)) library.TryAdd(Id(g.Kind, tmdb), (server.Id, server.Name, g.Key));
            }
        }

        // Seedbox folders are not matched to TMDB; compare their names and years instead.
        var local = _inventory.Peek(_servers.Local.Id) ?? new InventoryService.Snapshot(Array.Empty<NodeFile>(), DateTime.MinValue);
        var seedbox = BuildGroups(local, _catalog.State).Values
            .Where(g => g.Seedbox.Count > 0 && g.Kind is MediaKind.Movie or MediaKind.Tv)
            .Select(g =>
            {
                var (title, year) = MediaNames.ParseTitle(g.Name);
                return (g.Kind, g.Key, Title: title, Year: year);
            })
            .ToList();

        var result = new Dictionary<string, Presence>();
        foreach (var it in items)
        {
            var id = Id(it.Kind, it.TmdbId);
            var inLib = library.TryGetValue(id, out var hit);
            var sb = seedbox.FirstOrDefault(s => s.Kind == it.Kind
                && (s.Year == null || it.Year == null || Math.Abs(s.Year.Value - it.Year.Value) <= 1)
                && MediaNames.Similarity(s.Title, it.Title) >= 0.9);
            if (!inLib && sb.Key == null) continue;
            result[id] = new Presence(inLib ? hit.ServerId : null, inLib ? hit.ServerName : null, inLib ? hit.Key : null, sb.Key);
        }
        return result;
    }

    /// <summary>The IMDb id of a library title (for ratings), or null.</summary>
    /// <summary>The ids a library title is known by: its TMDB id (if the match has one), IMDb and TVDB.</summary>
    public async Task<(MediaKind Kind, string? TmdbId, string? ImdbId, string? TvdbId)> ExternalIdsAsync(string serverId, string key, CancellationToken ct)
    {
        var (g, meta) = await FindAsync(serverId, key, ct);
        if (meta == null || meta.Status == MatchStatus.Unmatched) return (g.Kind, null, null, null);
        var tmdb = meta.Provider == "TMDB" ? meta.ProviderId : meta.TmdbId;
        return (g.Kind, string.IsNullOrEmpty(tmdb) ? null : tmdb, meta.ImdbId, meta.Provider == "TVDB" ? meta.ProviderId : null);
    }

    public async Task<string?> ImdbIdAsync(string serverId, string key, CancellationToken ct)
    {
        var (_, meta) = await FindAsync(serverId, key, ct);
        return meta?.ImdbId;
    }

    // ---- News -------------------------------------------------------------------------------

    /// <summary>Newly released episodes of series you have, on every reachable media server.</summary>
    public async Task<IReadOnlyList<NewsItemDto>> GetNewsAsync(CancellationToken ct)
    {
        var list = new List<NewsItemDto>();
        foreach (var server in _servers.All)
        {
            LibraryDto lib;
            try { lib = await GetLibraryAsync(server.Id, ct); }
            catch (Exception ex) when (ex is RemoteNodeException or UserFacingException) { continue; }
            foreach (var t in lib.Titles.Where(t => t.NewEpisodes is { Count: > 0 }))
            foreach (var e in t.NewEpisodes!)
                list.Add(new NewsItemDto(server.Id, server.Name, t.Key, t.DisplayTitle, e));
        }
        return list.OrderByDescending(n => n.Episode.Aired, StringComparer.Ordinal).ToList();
    }

    // ---- Keeping episode lists and collections current ---------------------------------------

    /// <summary>
    /// Every 30 minutes: re-reads the episode list of series not checked in the last 12 hours
    /// (new episodes and air dates), and looks up the TMDB collection of movies matched before
    /// collections were stored. Gentle on the providers: one request at a time.
    /// </summary>
    private async Task RefreshLoopAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(30));
        do
        {
            foreach (var server in _servers.All)
            {
                try { await RefreshStaleAsync(server.Id, stoppingToken); }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { return; }
                catch (Exception ex) { _log.LogDebug(ex, "Episode refresh on {Server} failed", server.Id); }
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RefreshStaleAsync(string serverId, CancellationToken ct)
    {
        var inv = _inventory.Peek(serverId);
        if (inv == null) return;
        var groups = BuildGroups(inv, _catalog.State);
        var index = _index.All(serverId);
        foreach (var g in groups.Values)
        {
            if (!index.TryGetValue(g.Key, out var meta) || meta.Status == MatchStatus.Unmatched || meta.ProviderId.Length == 0) continue;
            var due = g.Kind switch
            {
                MediaKind.Tv => meta.CheckedUtc == null || DateTime.UtcNow - meta.CheckedUtc > EpisodeRefreshAge,
                MediaKind.Movie => meta.CheckedUtc == null && meta.Provider == "TMDB",
                _ => false,
            };
            if (!due) continue;
            var provider = _providers.FirstOrDefault(p => p.Name == meta.Provider);
            if (provider == null || !provider.IsConfigured) continue;
            try
            {
                var details = await provider.GetDetailsAsync(g.Kind, meta.ProviderId, ct);
                var current = _index.Get(serverId, g.Key);
                if (current == null || current.ProviderId != meta.ProviderId) continue;
                if (g.Kind == MediaKind.Tv && details.Episodes.Count > 0) current.Episodes = details.Episodes.ToList();
                current.CollectionId = details.CollectionId ?? current.CollectionId;
                current.CollectionName = details.CollectionName ?? current.CollectionName;
                current.CheckedUtc = DateTime.UtcNow;
                _index.Set(serverId, g.Key, current);
            }
            catch (Exception ex) when (ex is HttpRequestException or UserFacingException or TaskCanceledException && !ct.IsCancellationRequested)
            {
                _log.LogDebug(ex, "Could not refresh {Key}", g.Key);
            }
            await Task.Delay(TimeSpan.FromMilliseconds(400), ct);
        }
    }
}
