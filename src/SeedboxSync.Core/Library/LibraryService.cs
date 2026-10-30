using System.Collections.Concurrent;
using System.Threading.Channels;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Metadata;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Seedbox;
using SeedboxSync.Core.Subtitles;
using SeedboxSync.Core.Transfers;

namespace SeedboxSync.Core.Library;

/// <summary>
/// The media library of each server: titles derived from the folder structure (category /
/// title / files), matched against TMDB or TVDB (audiobooks use embedded tags), with artwork,
/// .nfo sidecars and subtitles written next to the media. File names are never changed.
/// New titles are matched in the background.
/// </summary>
public sealed partial class LibraryService : BackgroundService
{
    private readonly MediaServerRegistry _servers;
    private readonly InventoryService _inventory;
    private readonly SeedboxCatalog _catalog;
    private readonly LibraryIndex _index;
    private readonly SettingsStore _settings;
    private readonly IReadOnlyList<IMetadataProvider> _providers;
    private readonly OpenSubtitlesClient _subtitles;
    private readonly WatchHistory _history;
    private readonly HttpClient _http;
    private readonly ILogger<LibraryService> _log;
    private readonly Channel<(string Server, string Key)> _queue = Channel.CreateUnbounded<(string, string)>();
    private readonly HashSet<string> _queued = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _lock = new();

    public LibraryService(
        MediaServerRegistry servers,
        InventoryService inventory,
        SeedboxCatalog catalog,
        LibraryIndex index,
        SettingsStore settings,
        IEnumerable<IMetadataProvider> providers,
        OpenSubtitlesClient subtitles,
        WatchHistory history,
        HttpClient http,
        TransferQueue transfers,
        ILogger<LibraryService> log)
    {
        _servers = servers;
        _inventory = inventory;
        _catalog = catalog;
        _index = index;
        _settings = settings;
        _providers = providers.ToList();
        _subtitles = subtitles;
        _history = history;
        _http = http;
        _log = log;
        transfers.FileCompleted += OnFileCompleted;
    }

    public bool IsMatching
    {
        get { lock (_lock) return _queued.Count > 0; }
    }

    // ---- Building titles from files ------------------------------------------------------

    private sealed class TitleGroup
    {
        public required string Key { get; init; }
        public required string Category { get; init; }
        public required string Name { get; init; }
        public required MediaKind Kind { get; init; }
        public bool IsFolder { get; set; }
        public List<NodeFile> Files { get; } = new();

        /// <summary>Seedbox files under this title, keyed by their local-safe path.</summary>
        public Dictionary<string, CatalogEntry> Seedbox { get; } = new(RelPath.Comparer);
    }

    // Folders inside a movie that are not movies of their own.
    private static readonly HashSet<string> NoiseFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "sample", "samples", "sub", "subs", "subtitles", "extras", "extra", "featurettes", "featurette", "bonus",
        "behind the scenes", "deleted scenes", "interviews", "scenes", "shorts", "trailers", "trailer", "other",
        "proof", "screens", "screenshots", "covers", "artwork", "bdmv", "stream", "video_ts", "audio_ts", "certificate",
    };

    [System.Text.RegularExpressions.GeneratedRegex(@"(?:^|[ ._\-\[(])(?:cd|disc|disk|dvd|part|pt)[ ._\-]?\d", System.Text.RegularExpressions.RegexOptions.IgnoreCase)]
    private static partial System.Text.RegularExpressions.Regex PartRegex();

    /// <summary>
    /// Groups files into titles. TV and audiobooks: category/title. Movies: the folder that holds
    /// the movie's video, so packs ("Movies/Movie Gems Vol.1/Speed (1994)/…") list each movie on
    /// its own. Several videos loose in one folder are separate movies unless they are parts
    /// (CD1/CD2, Part 1/Part 2). Other files (subtitles, artwork, .nfo) join the title whose
    /// folder they are in.
    /// </summary>
    private static Dictionary<string, TitleGroup> BuildGroups(InventoryService.Snapshot inv, CatalogState catalog)
    {
        var groups = new Dictionary<string, TitleGroup>(RelPath.Comparer);

        // Every file from both sides, by local-safe path.
        var serverFiles = inv.Files.Values.ToList();
        var seedboxFiles = catalog.Entries.Where(e => !e.IsDirectory).Select(e => (Safe: RelPath.LocalSafe(e.Path), Entry: e)).ToList();
        var allPaths = serverFiles.Select(f => f.RelativePath).Concat(seedboxFiles.Select(x => x.Safe)).Distinct(RelPath.Comparer).ToList();

        // 1. Movie titles from video locations.
        var movieTitles = new HashSet<string>(RelPath.Comparer);        // folder keys and loose-file keys
        var videosByFolder = allPaths
            .Where(p => RelPath.Depth(p) >= 2 && MediaNames.KindOfCategory(RelPath.Segments(p)[0]) == MediaKind.Movie
                        && MediaNames.IsVideo(p) && !MediaNames.IsSample(p))
            .GroupBy(p => MovieFolder(p), RelPath.Comparer);
        foreach (var folder in videosByFolder)
        {
            var videos = folder.Distinct(RelPath.Comparer).ToList();
            var looseInCategory = RelPath.Depth(folder.Key) == 1;
            // Split only videos sitting directly in the folder (not BDMV/STREAM, Featurettes, …) that are not CD1/CD2-style parts.
            var direct = videos.All(v => RelPath.Comparer.Equals(RelPath.Parent(v), folder.Key));
            var separate = looseInCategory || (videos.Count > 1 && direct && !videos.All(v => PartRegex().IsMatch(RelPath.Name(v))));
            if (separate) foreach (var v in videos) movieTitles.Add(v);
            else movieTitles.Add(folder.Key);
        }

        string? KeyFor(string rel)
        {
            var segs = RelPath.Segments(rel);
            if (segs.Length < 2) return null;
            var kind = MediaNames.KindOfCategory(segs[0]);
            if (kind == MediaKind.Other) return null;
            if (kind != MediaKind.Movie) return segs[0] + "/" + segs[1];
            if (movieTitles.Contains(rel)) return rel;
            // Deepest movie title folder that contains the file.
            for (var d = segs.Length - 1; d >= 2; d--)
            {
                var anc = string.Join('/', segs.Take(d));
                if (movieTitles.Contains(anc)) return anc;
            }
            return null; // e.g. a pack's own .nfo; not part of any one movie
        }

        TitleGroup? GroupFor(string rel)
        {
            var key = KeyFor(rel);
            if (key == null) return null;
            if (!groups.TryGetValue(key, out var g))
            {
                var segs = RelPath.Segments(key);
                g = new TitleGroup { Key = key, Category = segs[0], Name = segs[^1], Kind = MediaNames.KindOfCategory(segs[0]) };
                groups[key] = g;
            }
            // The title is a folder (sidecars go inside it) unless it is a single loose file.
            if (!RelPath.Comparer.Equals(key, rel)) g.IsFolder = true;
            return g;
        }

        foreach (var f in serverFiles) GroupFor(f.RelativePath)?.Files.Add(f);
        foreach (var (safe, e) in seedboxFiles)
        {
            var g = GroupFor(safe);
            if (g != null) g.Seedbox[safe] = e;
        }
        return groups;
    }

    /// <summary>The folder a movie's video belongs to: its parent, skipping "Sample", "Subs", "BDMV/STREAM" and so on.</summary>
    private static string MovieFolder(string videoRel)
    {
        var folder = RelPath.Parent(videoRel);
        while (RelPath.Depth(folder) > 2 && NoiseFolders.Contains(RelPath.Name(folder))) folder = RelPath.Parent(folder);
        return folder;
    }

    /// <summary>The title a file belongs to, or null.</summary>
    private string? TitleKeyFor(string serverId, string path)
    {
        var inv = _inventory.Peek(serverId);
        if (inv == null) return null;
        var safe = RelPath.LocalSafe(RelPath.Normalize(path));
        return BuildGroups(inv, _catalog.State).Values.FirstOrDefault(g =>
            g.Files.Any(f => RelPath.Comparer.Equals(f.RelativePath, safe)) || g.Seedbox.ContainsKey(safe))?.Key;
    }

    private static List<NodeFile> MediaFiles(TitleGroup g) =>
        g.Files.Where(f => MediaNames.IsMedia(f.RelativePath) && !MediaNames.IsSample(f.RelativePath)).ToList();

    private static NodeFile? MainVideo(TitleGroup g) =>
        g.Files.Where(f => MediaNames.IsVideo(f.RelativePath) && !MediaNames.IsSample(f.RelativePath))
            .OrderByDescending(f => f.Size).FirstOrDefault();

    private static List<NodeFile> AudioParts(TitleGroup g) =>
        g.Files.Where(f => MediaNames.IsAudio(f.RelativePath))
            .OrderBy(f => f.RelativePath, NaturalComparer.Instance).ToList();

    private static List<SubtitleTrackDto> SubtitlesFor(TitleGroup g, string videoRel)
    {
        var dir = RelPath.Parent(videoRel);
        var videosInDir = g.Files.Count(f => MediaNames.IsVideo(f.RelativePath) && RelPath.Parent(f.RelativePath).Equals(dir, StringComparison.OrdinalIgnoreCase) && !MediaNames.IsSample(f.RelativePath));
        var list = new List<SubtitleTrackDto>();
        foreach (var s in g.Files.Where(f => MediaNames.IsSubtitle(f.RelativePath)))
        {
            var sdir = RelPath.Parent(s.RelativePath);
            var sameDir = sdir.Equals(dir, StringComparison.OrdinalIgnoreCase);
            var subsDir = RelPath.Parent(sdir).Equals(dir, StringComparison.OrdinalIgnoreCase) && RelPath.Name(sdir).StartsWith("sub", StringComparison.OrdinalIgnoreCase);
            if (!sameDir && !(subsDir && videosInDir == 1)) continue;
            string lang;
            var name = RelPath.Name(s.RelativePath);
            var vname = RelPath.Name(videoRel);
            if (Path.GetFileNameWithoutExtension(name).StartsWith(Path.GetFileNameWithoutExtension(vname), StringComparison.OrdinalIgnoreCase))
                lang = MediaNames.SubtitleLanguage(name, vname);
            else if (videosInDir == 1)
                lang = MediaNames.SubtitleLanguage("x." + name, "x.mkv");
            else continue;
            list.Add(new SubtitleTrackDto(lang, MediaNames.LanguageName(lang), s.RelativePath));
        }
        return list.OrderBy(t => t.Label).ToList();
    }

    private string DefaultProvider(MediaKind kind) => kind switch
    {
        MediaKind.Audiobook => "Tags",
        MediaKind.Tv => _settings.Current.Metadata.TvProvider switch
        {
            "tmdb" => "TMDB",
            "tvdb" => "TVDB",
            _ => Provider("TVDB").IsConfigured || !Provider("TMDB").IsConfigured ? "TVDB" : "TMDB",
        },
        _ => "TMDB",
    };

    private IMetadataProvider Provider(string name) =>
        _providers.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
        ?? throw new UserFacingException($"Unknown metadata provider '{name}'.");

    private TitleDto ToDto(TitleGroup g, TitleMeta? meta)
    {
        var media = MediaFiles(g);
        var serverMedia = new HashSet<string>(media.Select(f => f.RelativePath), RelPath.Comparer);
        var seedboxMedia = g.Seedbox.Keys.Where(k => MediaNames.IsMedia(k) && !MediaNames.IsSample(k)).ToList();
        var total = serverMedia.Union(seedboxMedia, RelPath.Comparer).Count();

        string display;
        int? year;
        string? credit = null;
        if (g.Kind == MediaKind.Audiobook)
        {
            var (t, author) = MediaNames.ParseAudiobook(g.Name);
            display = meta is { Status: not MatchStatus.Unmatched } && meta.Title.Length > 0 ? meta.Title : t;
            credit = meta?.Credit ?? author;
            year = meta?.Year;
        }
        else
        {
            // The provider's title once matched ("Mayor of Kingstown", not the folder's
            // "the mayer of kingstown"). Matches that need review keep the folder name.
            var (t, y) = MediaNames.ParseTitle(g.Name);
            display = meta is { Status: MatchStatus.Matched } && meta.Title.Length > 0 ? meta.Title : t;
            year = meta?.Year ?? y;
        }

        var match = meta == null
            ? new MatchDto(DefaultProvider(g.Kind), null, null, null, credit, MatchStatus.Unmatched, 0, "Not matched yet.", null, null)
            : new MatchDto(meta.Provider, meta.ProviderId, meta.Title, meta.Year, meta.Credit ?? credit, meta.Status, meta.Confidence, meta.Note, meta.Overview, meta.RuntimeMinutes);

        string? main = null;
        var subs = new List<string>();
        int? seasons = null, episodes = null;
        if (g.Kind == MediaKind.Movie)
        {
            main = MainVideo(g)?.RelativePath;
            if (main != null) subs = SubtitlesFor(g, main).Select(s => s.Language).Distinct().ToList();
        }
        else if (g.Kind == MediaKind.Audiobook)
        {
            main = AudioParts(g).FirstOrDefault()?.RelativePath;
        }
        else
        {
            var eps = BuildEpisodes(g, meta);
            seasons = eps.Count;
            episodes = eps.Sum(s => s.Episodes.Count(e => e.Available));
            subs = eps.SelectMany(s => s.Episodes).SelectMany(e => e.Subtitles).Select(s => s.Language).Distinct().ToList();
        }

        return new TitleDto(
            g.Key,
            g.Name,
            g.Kind,
            g.Category,
            display,
            year,
            g.Files.Sum(f => f.Size),
            serverMedia.Count,
            total,
            g.Seedbox.Count > 0,
            match,
            meta?.HasPoster ?? false,
            meta?.HasBackdrop ?? false,
            main,
            subs,
            seasons,
            episodes);
    }

    private static List<SeasonDto> BuildEpisodes(TitleGroup g, TitleMeta? meta)
    {
        var map = new Dictionary<(int, int), EpisodeDto>();
        var unnumbered = new Dictionary<int, int>();

        (int S, int E) Number(string rel)
        {
            var segs = RelPath.Segments(rel);
            var parent = segs.Length >= 3 ? segs[^2] : null;
            var p = MediaNames.ParseEpisode(segs[^1], parent);
            if (p != null) return p.Value;
            var s = MediaNames.ParseSeasonFolder(parent) ?? 1;
            unnumbered[s] = unnumbered.TryGetValue(s, out var n) ? n + 1 : 1;
            return (s, 900 + unnumbered[s]);
        }

        string TitleOf(int s, int e) =>
            meta?.Episodes.FirstOrDefault(x => x.Season == s && x.Episode == e)?.Title ?? (e >= 900 ? "Extra" : $"Episode {e}");

        int? RuntimeOf(int s, int e) =>
            meta?.Episodes.FirstOrDefault(x => x.Season == s && x.Episode == e)?.RuntimeMinutes ?? meta?.RuntimeMinutes;

        foreach (var f in g.Files.Where(x => MediaNames.IsVideo(x.RelativePath) && !MediaNames.IsSample(x.RelativePath))
                     .OrderBy(x => x.RelativePath, NaturalComparer.Instance))
        {
            var (s, e) = Number(f.RelativePath);
            g.Seedbox.TryGetValue(f.RelativePath, out var sb);
            map[(s, e)] = new EpisodeDto(f.RelativePath, s, e, TitleOf(s, e), RuntimeOf(s, e), f.Size, f.RelativePath, sb?.Path,
                true, sb != null, SubtitlesFor(g, f.RelativePath));
        }
        foreach (var (safe, entry) in g.Seedbox.Where(kv => MediaNames.IsVideo(kv.Key) && !MediaNames.IsSample(kv.Key))
                     .OrderBy(kv => kv.Key, NaturalComparer.Instance))
        {
            if (g.Files.Any(f => RelPath.Comparer.Equals(f.RelativePath, safe))) continue;
            var (s, e) = Number(safe);
            if (map.ContainsKey((s, e))) continue;
            map[(s, e)] = new EpisodeDto(safe, s, e, TitleOf(s, e), RuntimeOf(s, e), entry.Size, null, entry.Path,
                false, true, Array.Empty<SubtitleTrackDto>());
        }
        return map.Values
            .GroupBy(e => e.Season)
            .OrderBy(x => x.Key)
            .Select(x => new SeasonDto(x.Key, x.OrderBy(e => e.Episode).ToList()))
            .ToList();
    }

    // ---- Queries ------------------------------------------------------------------------

    public async Task<LibraryDto> GetLibraryAsync(string serverId, CancellationToken ct)
    {
        var server = _servers.Get(serverId);
        var inv = await _inventory.GetAsync(serverId, ct);
        var titles = EnrichedTitles(serverId, inv)
            .OrderBy(t => t.DisplayTitle, StringComparer.CurrentCultureIgnoreCase)
            .ToList();
        return new LibraryDto(server.Id, server.Name, server.LibraryRoot, inv.ScannedUtc, IsMatching, titles);
    }

    /// <summary>Every title on the server, with up next, new episodes, duplicates and so on.</summary>
    private List<TitleDto> EnrichedTitles(string serverId, InventoryService.Snapshot inv)
    {
        var groups = BuildGroups(inv, _catalog.State);
        var index = _index.All(serverId);
        return Enrich(serverId, groups.Values
            .Where(g => MediaFiles(g).Count > 0)
            .Select(g =>
            {
                var m = index.TryGetValue(g.Key, out var meta) ? meta : null;
                return (g, m, ToDto(g, m));
            })
            .ToList());
    }

    public async Task<TitleDetailDto> GetTitleAsync(string serverId, string key, CancellationToken ct)
    {
        var server = _servers.Get(serverId);
        var (g, meta) = await FindAsync(serverId, key, ct);
        var inv = await _inventory.GetAsync(serverId, ct);
        var dto = EnrichedTitles(serverId, inv).FirstOrDefault(t => t.Key.Equals(g.Key, StringComparison.OrdinalIgnoreCase)) ?? ToDto(g, meta);
        var node = _servers.GetNode(serverId);
        var seasons = g.Kind == MediaKind.Tv ? Episodes(serverId, g, meta) : new List<SeasonDto>();
        var parts = g.Kind == MediaKind.Audiobook ? AudioParts(g).Select(f => f.RelativePath).ToList() : new List<string>();
        var tracks = g.Kind == MediaKind.Movie && dto.MainFile != null ? SubtitlesFor(g, dto.MainFile) : new List<SubtitleTrackDto>();
        // Subtitle tracks inside the video files, next to the .srt files beside them.
        if (g.Kind == MediaKind.Movie && dto.MainFile != null)
            tracks = tracks.Concat(await EmbeddedTracksAsync(serverId, node, g, dto.MainFile, ct)).ToList();
        if (g.Kind == MediaKind.Tv)
        {
            var withEmbedded = new List<SeasonDto>();
            foreach (var season in seasons)
            {
                var eps = new List<EpisodeDto>();
                foreach (var e in season.Episodes)
                {
                    eps.Add(e.Available && e.Path != null
                        ? e with { Subtitles = e.Subtitles.Concat(await EmbeddedTracksAsync(serverId, node, g, e.Path, ct)).ToList() }
                        : e);
                }
                withEmbedded.Add(season with { Episodes = eps });
            }
            seasons = withEmbedded;
        }
        var sidecars = g.Files.Select(f => RelPath.Name(f.RelativePath))
            .Where(n => n.EndsWith(".nfo", StringComparison.OrdinalIgnoreCase) || n is "poster.jpg" or "fanart.jpg" or "cover.jpg" or "folder.jpg")
            .Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var seedboxRoot = _settings.Current.Seedbox.MediaRoot;
        // The title's path on the seedbox: the same number of segments as the key, from a raw seedbox path.
        var depth = RelPath.Depth(g.Key);
        var seedboxKey = g.Seedbox.Values.FirstOrDefault()?.Path is { } p
            ? string.Join('/', RelPath.Segments(p).Take(g.IsFolder ? depth : RelPath.Depth(p)))
            : null;
        return new TitleDetailDto(
            dto,
            RelPath.ToLocal(server.LibraryRoot, g.Key),
            seedboxKey == null ? null : RelPath.ToRemote(seedboxRoot, seedboxKey),
            seasons,
            parts,
            tracks,
            sidecars);
    }

    /// <summary>Subtitle tracks inside a video, read from its header once per file version.</summary>
    private async Task<IReadOnlyList<SubtitleTrackDto>> EmbeddedTracksAsync(string serverId, IMediaNode node, TitleGroup g, string videoPath, CancellationToken ct)
    {
        var file = g.Files.FirstOrDefault(f => RelPath.Comparer.Equals(f.RelativePath, videoPath));
        if (file == null) return Array.Empty<SubtitleTrackDto>();
        var cacheKey = serverId + "|" + file.RelativePath;
        IReadOnlyList<EmbeddedSubtitle> found;
        if (_embedded.TryGetValue(cacheKey, out var cached) && cached.Size == file.Size && cached.Modified == file.ModifiedUtc)
        {
            found = cached.Tracks;
        }
        else
        {
            try
            {
                found = await EmbeddedSubtitles.ReadAsync(node, file.RelativePath, file.Size, ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Unreadable or unusual file: show no embedded tracks rather than fail the page.
                _log.LogDebug(ex, "Could not read subtitle tracks in {Path}", file.RelativePath);
                found = Array.Empty<EmbeddedSubtitle>();
            }
            _embedded[cacheKey] = (file.Size, file.ModifiedUtc, found);
        }
        return found.Select(t => new SubtitleTrackDto(
            t.Language,
            $"{MediaNames.LanguageName(t.Language)} (embedded{(t.Forced ? ", forced" : "")})",
            file.RelativePath,
            true)).ToList();
    }

    private readonly ConcurrentDictionary<string, (long Size, DateTime Modified, IReadOnlyList<EmbeddedSubtitle> Tracks)> _embedded = new();

    private async Task<(TitleGroup Group, TitleMeta? Meta)> FindAsync(string serverId, string key, CancellationToken ct)
    {
        key = RelPath.Normalize(key);
        var inv = await _inventory.GetAsync(serverId, ct);
        var groups = BuildGroups(inv, _catalog.State);
        if (!groups.TryGetValue(key, out var g) || MediaFiles(g).Count == 0)
            throw new UserFacingException("That title is not on this media server.", 404);
        return (g, _index.Get(serverId, key));
    }

    // ---- Scanning and matching ----------------------------------------------------------

    public async Task<ScanResultDto> ScanAsync(string serverId, CancellationToken ct)
    {
        _servers.Get(serverId);
        var inv = await _inventory.ScanAsync(serverId, ct);
        var groups = BuildGroups(inv, _catalog.State);
        var index = _index.All(serverId);
        int queued = 0;
        foreach (var g in groups.Values.Where(x => MediaFiles(x).Count > 0))
        {
            index.TryGetValue(g.Key, out var m);
            if (m == null || (m.Status == MatchStatus.Unmatched && string.IsNullOrEmpty(m.ProviderId) && m.Note != ManualNote))
            {
                if (Enqueue(serverId, g.Key)) queued++;
            }
        }
        var titles = groups.Values.Where(g => MediaFiles(g).Count > 0).ToList();
        var review = titles.Count(g => index.TryGetValue(g.Key, out var m) && m.Status == MatchStatus.Review);
        var unmatched = titles.Count(g => !index.TryGetValue(g.Key, out var m) || m.Status == MatchStatus.Unmatched);
        return new ScanResultDto(titles.Count, review, unmatched, queued);
    }

    private const string ManualNote = "Cleared by user.";

    private bool Enqueue(string serverId, string key)
    {
        lock (_lock)
        {
            if (!_queued.Add(serverId + "|" + key)) return false;
        }
        _queue.Writer.TryWrite((serverId, key));
        return true;
    }

    private void OnFileCompleted(string serverId, string path)
    {
        var key = TitleKeyFor(serverId, path);
        if (key != null && _index.Get(serverId, key) == null) Enqueue(serverId, key);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _ = Task.Run(() => RefreshLoopAsync(stoppingToken), stoppingToken);

        // Initial scan of every server so the library is ready when the UI opens. Remote PCs
        // that are off are skipped and scanned when someone opens their library.
        _ = Task.Run(async () =>
        {
            foreach (var s in _servers.All)
            {
                try { await ScanAsync(s.Id, stoppingToken); }
                catch (Exception ex) when (ex is not OperationCanceledException) { _log.LogWarning(ex, "Initial scan of {Server} failed", s.Id); }
            }
        }, stoppingToken);

        await foreach (var (server, key) in _queue.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await AutoMatchAsync(server, key, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Matching {Key} on {Server} failed", key, server);
            }
            finally
            {
                lock (_lock) _queued.Remove(server + "|" + key);
            }
        }
    }

    private async Task AutoMatchAsync(string serverId, string key, CancellationToken ct)
    {
        TitleGroup g;
        try { (g, _) = await FindAsync(serverId, key, ct); }
        catch (UserFacingException) { return; }

        if (g.Kind == MediaKind.Audiobook)
        {
            await MatchFromTagsAsync(serverId, g, ct);
            return;
        }

        var providerName = DefaultProvider(g.Kind);
        var provider = Provider(providerName);
        var (title, year) = MediaNames.ParseTitle(g.Name);
        if (!provider.IsConfigured)
        {
            _index.Set(serverId, key, new TitleMeta
            {
                Provider = providerName,
                Status = MatchStatus.Unmatched,
                Note = $"Add a {providerName} API key in Settings to match this title.",
            });
            return;
        }

        IReadOnlyList<MetadataCandidate> candidates;
        try
        {
            candidates = await provider.SearchAsync(g.Kind, title, year, ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or UserFacingException or TaskCanceledException)
        {
            _index.Set(serverId, key, new TitleMeta { Provider = providerName, Status = MatchStatus.Unmatched, Note = $"{providerName} search failed: {ex.Message}" });
            return;
        }

        var best = candidates
            .Take(10)
            .Select((c, i) => (Candidate: c, Score: Score(title, year, c) - i * 0.5))
            .OrderByDescending(x => x.Score)
            .FirstOrDefault();

        if (best.Candidate == null || best.Score < 50)
        {
            _index.Set(serverId, key, new TitleMeta
            {
                Provider = providerName,
                Status = MatchStatus.Unmatched,
                Note = $"No {providerName} result for \"{g.Name}\". Search with the original title.",
            });
            return;
        }

        var yearOk = year == null || best.Candidate.Year == null || Math.Abs(best.Candidate.Year.Value - year.Value) <= 1;
        var status = best.Score >= 85 && yearOk ? MatchStatus.Matched : MatchStatus.Review;
        var note = status == MatchStatus.Review
            ? (yearOk ? "Low title similarity. Confirm or pick another result." : $"The folder says {year} but the best result is from {best.Candidate.Year}. Confirm or pick another result.")
            : null;
        await ApplyAsync(serverId, g, provider, best.Candidate.Id, status, (int)Math.Round(Math.Clamp(best.Score, 0, 100)), note, ct);
    }

    private static double Score(string title, int? year, MetadataCandidate c)
    {
        var s = MediaNames.Similarity(title, c.Title) * 100;
        if (year != null && c.Year != null)
        {
            var diff = Math.Abs(c.Year.Value - year.Value);
            s -= diff == 0 ? 0 : diff == 1 ? 5 : 25;
        }
        return s;
    }

    private async Task MatchFromTagsAsync(string serverId, TitleGroup g, CancellationToken ct)
    {
        var node = _servers.GetNode(serverId);
        var (title, author) = MediaNames.ParseAudiobook(g.Name);
        var first = AudioParts(g).FirstOrDefault();
        MediaTags? tags = first == null ? null : await node.ReadTagsAsync(first.RelativePath, ct);
        var meta = new TitleMeta
        {
            Provider = "Tags",
            Title = string.IsNullOrWhiteSpace(tags?.Album) ? (string.IsNullOrWhiteSpace(tags?.Title) ? title : tags!.Title!) : tags!.Album!,
            Credit = string.IsNullOrWhiteSpace(tags?.Author) ? author : tags!.Author,
            Year = tags?.Year,
            RuntimeMinutes = tags?.DurationSeconds is { } d ? (int)Math.Round(AudioParts(g).Count > 1 ? 0 : d / 60) : null,
            Status = MatchStatus.Matched,
            Confidence = 100,
        };
        if (meta.RuntimeMinutes == 0) meta.RuntimeMinutes = null;

        // Cover: a cover.jpg/folder.jpg from the seedbox wins over the embedded picture.
        var coverFile = g.Files.FirstOrDefault(f => RelPath.Name(f.RelativePath).ToLowerInvariant() is "cover.jpg" or "folder.jpg" or "cover.png" or "poster.jpg");
        var posterPath = _index.ArtworkPath(serverId, g.Key, "poster");
        try
        {
            if (coverFile != null)
            {
                await using var s = await node.OpenReadAsync(coverFile.RelativePath, ct);
                await SaveFileAsync(posterPath, s, ct);
                meta.HasPoster = true;
            }
            else if (tags?.Cover is { Length: > 0 } bytes)
            {
                await using var s = new MemoryStream(bytes);
                await SaveFileAsync(posterPath, s, ct);
                meta.HasPoster = true;
            }
        }
        catch (IOException ex)
        {
            _log.LogDebug(ex, "Could not cache audiobook cover for {Key}", g.Key);
        }
        _index.Set(serverId, g.Key, meta);
    }

    public async Task<IReadOnlyList<MetadataCandidate>> SearchAsync(string providerName, MediaKind kind, string query, int? year, CancellationToken ct)
    {
        var provider = Provider(providerName);
        if (!provider.Supports(kind)) throw new UserFacingException($"{provider.Name} does not cover {(kind == MediaKind.Movie ? "movies" : "this media type")}.");
        if (string.IsNullOrWhiteSpace(query)) return Array.Empty<MetadataCandidate>();
        var results = await provider.SearchAsync(kind, query.Trim(), year, ct);
        // Score against the query so the UI can show a percentage like the automatic matcher.
        return results.Take(20)
            .Select(c => c with { Score = (int)Math.Round(Math.Clamp(Score(query, year, c), 0, 100)) })
            .ToList();
    }

    public async Task<TitleDto> ApplyMatchAsync(string serverId, string key, string providerName, string id, CancellationToken ct)
    {
        var (g, _) = await FindAsync(serverId, key, ct);
        var provider = Provider(providerName);
        await ApplyAsync(serverId, g, provider, id, MatchStatus.Matched, 100, null, ct);
        return ToDto(g, _index.Get(serverId, g.Key));
    }

    public async Task<TitleDto> RefreshMetadataAsync(string serverId, string key, CancellationToken ct)
    {
        var (g, meta) = await FindAsync(serverId, key, ct);
        if (g.Kind == MediaKind.Audiobook || meta?.Provider == "Tags")
        {
            await MatchFromTagsAsync(serverId, g, ct);
        }
        else if (meta != null && !string.IsNullOrEmpty(meta.ProviderId))
        {
            await ApplyAsync(serverId, g, Provider(meta.Provider), meta.ProviderId, meta.Status, meta.Confidence, meta.Note, ct);
        }
        else
        {
            await AutoMatchAsync(serverId, g.Key, ct);
        }
        return ToDto(g, _index.Get(serverId, g.Key));
    }

    private async Task ApplyAsync(string serverId, TitleGroup g, IMetadataProvider provider, string id, MatchStatus status, int confidence, string? note, CancellationToken ct)
    {
        var details = await provider.GetDetailsAsync(g.Kind, id, ct);
        var meta = new TitleMeta
        {
            Provider = provider.Name,
            ProviderId = details.Id,
            Title = details.Title,
            Year = details.Year,
            Credit = details.Credit,
            Overview = details.Overview,
            RuntimeMinutes = details.RuntimeMinutes,
            ImdbId = details.ImdbId,
            TmdbId = details.TmdbId,
            Genres = details.Genres.ToList(),
            Episodes = details.Episodes.ToList(),
            Status = status,
            Confidence = confidence,
            Note = note,
            CollectionId = details.CollectionId,
            CollectionName = details.CollectionName,
            CheckedUtc = DateTime.UtcNow,
        };

        var node = _servers.GetNode(serverId);
        var sidecars = _settings.Current.Metadata.WriteSidecars && g.IsFolder;
        meta.HasPoster = await FetchArtworkAsync(serverId, g, details.PosterUrl, "poster", sidecars ? "poster.jpg" : null, node, ct);
        meta.HasBackdrop = await FetchArtworkAsync(serverId, g, details.BackdropUrl, "fanart", sidecars ? "fanart.jpg" : null, node, ct);

        if (sidecars)
        {
            try
            {
                var nfo = g.Kind == MediaKind.Tv ? NfoWriter.TvShow(meta) : NfoWriter.Movie(meta);
                var name = g.Kind == MediaKind.Tv ? "tvshow.nfo" : "movie.nfo";
                await using var ms = new MemoryStream(nfo);
                await node.WriteFileAsync(g.Key + "/" + name, ms, ct);
                if (await node.GetFileAsync(g.Key + "/" + name, ct) is { } nf) _inventory.Upsert(serverId, nf);
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
            {
                _log.LogWarning(ex, "Could not write .nfo for {Key}", g.Key);
            }
        }
        _index.Set(serverId, g.Key, meta);
    }

    private async Task<bool> FetchArtworkAsync(string serverId, TitleGroup g, string? url, string kind, string? sidecarName, IMediaNode node, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(url)) return false;
        try
        {
            var bytes = await _http.GetByteArrayAsync(url, ct);
            await using (var ms = new MemoryStream(bytes))
                await SaveFileAsync(_index.ArtworkPath(serverId, g.Key, kind), ms, ct);
            if (sidecarName != null)
            {
                await using var ms2 = new MemoryStream(bytes);
                await node.WriteFileAsync(g.Key + "/" + sidecarName, ms2, ct);
                if (await node.GetFileAsync(g.Key + "/" + sidecarName, ct) is { } nf) _inventory.Upsert(serverId, nf);
            }
            return true;
        }
        catch (Exception ex) when (ex is HttpRequestException or IOException or UnauthorizedAccessException or TaskCanceledException)
        {
            _log.LogWarning(ex, "Could not fetch {Kind} for {Key}", kind, g.Key);
            return false;
        }
    }

    private static async Task SaveFileAsync(string path, Stream content, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var tmp = path + ".tmp";
        await using (var fs = File.Create(tmp)) await content.CopyToAsync(fs, ct);
        File.Move(tmp, path, true);
    }

    /// <summary>Poster or fanart for a title: the cached copy, else a sidecar on the server.</summary>
    public async Task<Stream?> OpenArtworkAsync(string serverId, string key, string kind, CancellationToken ct)
    {
        key = RelPath.Normalize(key);
        var cached = _index.ArtworkPath(serverId, key, kind == "fanart" ? "fanart" : "poster");
        if (File.Exists(cached)) return File.OpenRead(cached);
        var node = _servers.GetNode(serverId);
        foreach (var name in kind == "fanart" ? new[] { "fanart.jpg", "backdrop.jpg" } : new[] { "poster.jpg", "cover.jpg", "folder.jpg" })
        {
            if (await node.GetFileAsync(key + "/" + name, ct) != null) return await node.OpenReadAsync(key + "/" + name, ct);
        }
        return null;
    }

    // ---- Subtitles ------------------------------------------------------------------------

    public async Task<SubtitleResultDto> FetchSubtitlesAsync(string serverId, string key, string? episodePath, CancellationToken ct)
    {
        var (g, meta) = await FindAsync(serverId, key, ct);
        if (g.Kind == MediaKind.Audiobook) throw new UserFacingException("Audiobooks have no subtitles.");
        if (meta == null || meta.Status == MatchStatus.Unmatched)
            throw new UserFacingException("Match the title first. Subtitles are looked up by the matched title.");
        var langs = _settings.Current.Metadata.LanguageList;
        var node = _servers.GetNode(serverId);

        var videos = new List<(string Path, int? Season, int? Episode)>();
        if (g.Kind == MediaKind.Movie)
        {
            var main = MainVideo(g) ?? throw new UserFacingException("No video file found for this title.");
            videos.Add((main.RelativePath, null, null));
        }
        else
        {
            foreach (var e in BuildEpisodes(g, meta).SelectMany(x => x.Episodes).Where(x => x.Available && x.Path != null))
            {
                if (episodePath != null && !RelPath.Comparer.Equals(e.Path, RelPath.Normalize(episodePath))) continue;
                // Skip episodes that already have every language.
                if (episodePath == null && langs.All(l => e.Subtitles.Any(s => s.Language == l))) continue;
                videos.Add((e.Path!, e.Season, e.Episode));
            }
        }

        int found = 0, exact = 0;
        var foundLangs = new HashSet<string>();
        foreach (var v in videos.Take(60))
        {
            var q = await SubtitleQueryForAsync(node, g, meta, v.Path, v.Season, v.Episode, ct);
            var subs = await _subtitles.FetchAsync(q, langs, ct);
            foreach (var s in subs)
            {
                if (s.Exact) exact++;
                await SaveSubtitleAsync(serverId, node, v.Path, s.Language, s.Content, ct);
                found++;
                foundLangs.Add(s.Language);
            }
        }
        return new SubtitleResultDto(found, foundLangs.OrderBy(l => l).ToList(), videos.Count, exact);
    }

    /// <summary>
    /// Every subtitle for one video (a movie's main file, or one episode), scored for how well it
    /// will line up with that file, best first. Nothing is downloaded.
    /// </summary>
    public async Task<SubtitleSearchDto> SearchSubtitlesAsync(string serverId, string key, string? episodePath, string? language, CancellationToken ct)
    {
        var (g, meta, video) = await SubtitleTargetAsync(serverId, key, episodePath, ct);
        var node = _servers.GetNode(serverId);
        var q = await SubtitleQueryForAsync(node, g, meta, video.Path, video.Season, video.Episode, ct);
        // One language picked in the dialog, or all languages from Settings.
        var lang = new string((language ?? "").ToLowerInvariant().Where(char.IsLetter).ToArray());
        var langs = lang.Length is >= 2 and <= 3 ? new List<string> { lang } : _settings.Current.Metadata.LanguageList;
        var list = await _subtitles.SearchAsync(q, langs, ct);
        return new SubtitleSearchDto(video.Path, q.ReleaseName, q.MovieHash != null, list);
    }

    /// <summary>Downloads the subtitle the user picked and saves it next to the video as name.lang.srt.</summary>
    public async Task<string> DownloadSubtitleAsync(string serverId, string key, string? episodePath, int fileId, string language, CancellationToken ct)
    {
        var (_, _, video) = await SubtitleTargetAsync(serverId, key, episodePath, ct);
        var lang = new string((language ?? "").ToLowerInvariant().Where(char.IsLetter).ToArray());
        if (lang.Length is < 2 or > 3) throw new UserFacingException("Unknown subtitle language.");
        var (bytes, _) = await _subtitles.DownloadAsync(fileId, ct);
        return await SaveSubtitleAsync(serverId, _servers.GetNode(serverId), video.Path, lang, bytes, ct);
    }

    private async Task<(TitleGroup G, TitleMeta Meta, (string Path, int? Season, int? Episode) Video)> SubtitleTargetAsync(
        string serverId, string key, string? episodePath, CancellationToken ct)
    {
        var (g, meta) = await FindAsync(serverId, key, ct);
        if (g.Kind == MediaKind.Audiobook) throw new UserFacingException("Audiobooks have no subtitles.");
        if (meta == null || meta.Status == MatchStatus.Unmatched)
            throw new UserFacingException("Match the title first. Subtitles are looked up by the matched title.");
        if (g.Kind == MediaKind.Movie)
        {
            var main = MainVideo(g) ?? throw new UserFacingException("No video file found for this title.");
            return (g, meta, (main.RelativePath, null, null));
        }
        if (episodePath == null) throw new UserFacingException("Choose an episode first.");
        var e = BuildEpisodes(g, meta).SelectMany(x => x.Episodes)
            .FirstOrDefault(x => x.Available && x.Path != null && RelPath.Comparer.Equals(x.Path, RelPath.Normalize(episodePath)))
            ?? throw new UserFacingException("That episode is not on this media server.", 404);
        return (g, meta, (e.Path!, e.Season, e.Episode));
    }

    /// <summary>
    /// Subtitles are timed to one release: search with this file's OpenSubtitles hash (finds ones
    /// made for this exact file) and its release name. The tags are often only in the folder name
    /// (Apollo.13.1995.REMASTERED.1080p.BluRay.x265/apollo13.mkv).
    /// </summary>
    private async Task<SubtitleQuery> SubtitleQueryForAsync(IMediaNode node, TitleGroup g, TitleMeta meta, string path, int? season, int? episode, CancellationToken ct)
    {
        string? hash = null;
        var size = g.Files.FirstOrDefault(f => RelPath.Comparer.Equals(f.RelativePath, path))?.Size ?? 0;
        try { hash = await OpenSubtitlesHash.ComputeAsync(node, path, size, ct); }
        catch (Exception ex) when (ex is IOException or UserFacingException or RemoteNodeException) { _log.LogDebug(ex, "Could not hash {Path}", path); }
        var release = RelPath.Name(path);
        if (!ReleaseTags.Parse(release).HasTags && RelPath.Parent(path) is { Length: > 0 } folder) release = RelPath.Name(folder);
        var tmdb = meta.Provider == "TMDB" ? meta.ProviderId : meta.TmdbId;
        return new SubtitleQuery(tmdb, meta.ImdbId, meta.Title, meta.Year, season, episode, g.Kind == MediaKind.Tv, hash, release);
    }

    private async Task<string> SaveSubtitleAsync(string serverId, IMediaNode node, string videoPath, string lang, byte[] content, CancellationToken ct)
    {
        var name = Path.GetFileNameWithoutExtension(RelPath.Name(videoPath)) + "." + lang + ".srt";
        var rel = RelPath.Combine(RelPath.Parent(videoPath), name);
        await using var ms = new MemoryStream(content);
        await node.WriteFileAsync(rel, ms, ct);
        if (await node.GetFileAsync(rel, ct) is { } nf) _inventory.Upsert(serverId, nf);
        return rel;
    }
}
