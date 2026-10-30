using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Metadata;

namespace SeedboxSync.Core.Subtitles;

public sealed record SubtitleQuery(
    string? TmdbId,
    string? ImdbId,
    string? Title,
    int? Year,
    int? Season,
    int? Episode,
    bool IsEpisode,
    string? MovieHash = null,
    string? ReleaseName = null);

/// <summary>
/// A downloaded subtitle. <c>Exact</c>: registered for this very file (hash match), so it is in
/// sync. Otherwise it was chosen by release name and may need a delay in the player.
/// </summary>
public sealed record SubtitleFile(string Language, byte[] Content, string FileName, bool Exact, string? Release);

/// <summary>
/// One search result with Seedbox Sync's estimate (0–100) of how well it will line up with this
/// file: made for this exact file (hash), else how close the release name is, then downloads.
/// </summary>
public sealed record SubtitleCandidate(
    int FileId,
    string Language,
    string? Release,
    string? FileName,
    int Score,
    bool Exact,
    bool MachineTranslated,
    bool HearingImpaired,
    int Downloads,
    double? Fps,
    DateTime? Uploaded,
    string Reason);

/// <summary>
/// OpenSubtitles.com REST API. Searching needs an API key (free consumer key from
/// opensubtitles.com/consumers); downloading also needs the account's username and password.
/// </summary>
public sealed class OpenSubtitlesClient
{
    private const string DefaultBase = "https://api.opensubtitles.com/api/v1";
    private readonly HttpClient _http;
    private readonly SettingsStore _settings;
    private readonly SemaphoreSlim _loginLock = new(1, 1);
    private string? _token;
    private string? _tokenFor;
    private string _base = DefaultBase;
    private DateTime _tokenExpires;

    public OpenSubtitlesClient(HttpClient http, SettingsStore settings)
    {
        _http = http;
        _settings = settings;
    }

    public bool IsConfigured
    {
        get
        {
            var m = _settings.Current.Metadata;
            return m.OpenSubtitlesApiKey.Length > 0 && m.OpenSubtitlesUsername.Length > 0 && m.OpenSubtitlesPassword.Length > 0;
        }
    }

    /// <summary>Finds and downloads the best subtitle for each language. Languages with no result are skipped.</summary>
    public async Task<IReadOnlyList<SubtitleFile>> FetchAsync(SubtitleQuery q, IReadOnlyList<string> languages, CancellationToken ct)
    {
        var candidates = await SearchAsync(q, languages, ct);
        var result = new List<SubtitleFile>();
        foreach (var best in candidates.GroupBy(c => c.Language).Select(g => g.First()))
        {
            var (bytes, name) = await DownloadAsync(best.FileId, ct);
            result.Add(new SubtitleFile(best.Language, bytes, name, best.Exact, best.Release));
        }
        return result;
    }

    /// <summary>Every subtitle for the title in the chosen languages, best first.</summary>
    public async Task<IReadOnlyList<SubtitleCandidate>> SearchAsync(SubtitleQuery q, IReadOnlyList<string> languages, CancellationToken ct)
    {
        var m = _settings.Current.Metadata;
        if (m.OpenSubtitlesApiKey.Length == 0)
            throw new UserFacingException("Add an OpenSubtitles API key in Settings → Metadata providers.");
        if (languages.Count == 0)
            throw new UserFacingException("Set at least one subtitle language in Settings → Metadata providers.");

        // OpenSubtitles wants query parameters sorted and lower-case, or it redirects.
        var query = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["languages"] = string.Join(',', languages.OrderBy(l => l)),
        };
        if (q.MovieHash != null) query["moviehash"] = q.MovieHash;
        if (q.IsEpisode)
        {
            if (q.TmdbId != null) query["parent_tmdb_id"] = q.TmdbId;
            else if (q.Title != null) { query["query"] = q.Title; query["type"] = "episode"; }
            if (q.Season != null) query["season_number"] = q.Season.Value.ToString();
            if (q.Episode != null) query["episode_number"] = q.Episode.Value.ToString();
        }
        else
        {
            if (q.TmdbId != null) query["tmdb_id"] = q.TmdbId;
            else if (q.ImdbId != null) query["imdb_id"] = q.ImdbId.Replace("tt", "");
            else if (q.Title != null)
            {
                query["query"] = q.Title;
                query["type"] = "movie";
                if (q.Year != null) query["year"] = q.Year.Value.ToString();
            }
        }
        var url = DefaultBase + "/subtitles?" + string.Join('&', query.Select(kv => kv.Key + "=" + Uri.EscapeDataString(kv.Value.ToLowerInvariant())));

        using var search = Request(HttpMethod.Get, url, m.OpenSubtitlesApiKey, null);
        using var res = await _http.SendAsync(search, ct);
        await ThrowIfFailed(res, ct);
        await using var stream = await res.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

        var mine = ReleaseTags.Parse(q.ReleaseName);
        var list = new List<SubtitleCandidate>();
        foreach (var d in doc.RootElement.Arr("data"))
        {
            if (d.Prop("attributes") is not { } a) continue;
            var file = a.Arr("files").FirstOrDefault(f => f.Int("file_id") != null);
            if (file.ValueKind != JsonValueKind.Object) continue;
            var lang = NormalizeLang((a.Str("language") ?? "").ToLowerInvariant());
            if (lang.Length == 0 || !languages.Contains(lang)) continue;
            var release = a.Str("release");
            var fileName = file.Str("file_name");
            var exact = a.Prop("moviehash_match")?.ValueKind == JsonValueKind.True;
            var machine = a.Prop("machine_translated")?.ValueKind == JsonValueKind.True || a.Prop("ai_translated")?.ValueKind == JsonValueKind.True;
            var downloads = a.Int("download_count") ?? 0;
            var theirs = ReleaseTags.Parse(release);
            var byFile = ReleaseTags.Parse(fileName);
            var other = mine.Similarity(byFile) > mine.Similarity(theirs) ? byFile : theirs;
            var (score, reason) = Score(mine, other, exact, machine, downloads);
            double? fps = a.Prop("fps") is { ValueKind: JsonValueKind.Number } f && f.TryGetDouble(out var fv) && fv > 0 ? fv : null;
            DateTime? uploaded = DateTime.TryParse(a.Str("upload_date"), System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.AdjustToUniversal | System.Globalization.DateTimeStyles.AssumeUniversal, out var up) ? up : null;
            list.Add(new SubtitleCandidate(file.Int("file_id")!.Value, lang, release, fileName, score, exact, machine,
                a.Prop("hearing_impaired")?.ValueKind == JsonValueKind.True, downloads, fps, uploaded, reason));
        }
        return list.OrderByDescending(c => c.Score).ThenByDescending(c => c.Downloads).ToList();
    }

    /// <summary>Downloads one subtitle as SRT. Needs the OpenSubtitles login; counts against the daily quota.</summary>
    public async Task<(byte[] Content, string FileName)> DownloadAsync(int fileId, CancellationToken ct)
    {
        var m = _settings.Current.Metadata;
        if (m.OpenSubtitlesUsername.Length == 0 || m.OpenSubtitlesPassword.Length == 0)
            throw new UserFacingException("Add your OpenSubtitles username and password in Settings → Metadata providers.");
        var token = await LoginAsync(ct);
        using var dl = Request(HttpMethod.Post, _base + "/download", m.OpenSubtitlesApiKey, token);
        dl.Content = JsonContent.Create(new { file_id = fileId, sub_format = "srt" });
        using var dlRes = await _http.SendAsync(dl, ct);
        await ThrowIfFailed(dlRes, ct);
        await using var ds = await dlRes.Content.ReadAsStreamAsync(ct);
        using var ddoc = await JsonDocument.ParseAsync(ds, cancellationToken: ct);
        var link = ddoc.RootElement.Str("link") ?? throw new UserFacingException("OpenSubtitles returned no download link.", 502);
        var bytes = await _http.GetByteArrayAsync(link, ct);
        return (bytes, ddoc.RootElement.Str("file_name") ?? "subtitle.srt");
    }

    /// <summary>
    /// 0–100. A hash match was timed against this very file: 99. Otherwise the release name
    /// decides (same group and source near 85, different source or edition low), downloads add a
    /// little, and machine translation halves it.
    /// </summary>
    internal static (int Score, string Reason) Score(ReleaseTags mine, ReleaseTags theirs, bool exact, bool machine, int downloads)
    {
        string reason;
        double score;
        if (exact)
        {
            score = 99;
            reason = "Made for this exact file";
        }
        else
        {
            var sim = mine.Similarity(theirs);
            score = Math.Clamp(31 + sim * 3, 5, 85) + Math.Min(10, Math.Log10(downloads + 1) * 3);
            var parts = new List<string>();
            if (mine.Group != null && mine.Group == theirs.Group) parts.Add("same release group");
            if (mine.Source != null && theirs.Source != null) parts.Add(mine.Source == theirs.Source ? $"same source ({theirs.Source})" : $"different source ({theirs.Source})");
            if (mine.Editions.Count > 0 || theirs.Editions.Count > 0)
                parts.Add(mine.Editions.SetEquals(theirs.Editions) ? "same edition" : "different edition");
            if (mine.Resolution != null && mine.Resolution == theirs.Resolution) parts.Add("same resolution");
            reason = parts.Count > 0 ? char.ToUpperInvariant(parts[0][0]) + string.Join(", ", parts)[1..] : "Release unknown";
            score = Math.Min(score, 95);
        }
        if (machine)
        {
            score /= 2;
            reason += "; machine translated";
        }
        return ((int)Math.Round(score), reason);
    }

    private static string NormalizeLang(string l) => l switch
    {
        "nb" or "nn" => "no",
        "pt-br" or "pt-pt" => "pt",
        "zh-cn" or "zh-tw" => "zh",
        _ => l,
    };

    private async Task<string> LoginAsync(CancellationToken ct)
    {
        var m = _settings.Current.Metadata;
        var who = m.OpenSubtitlesUsername + "|" + m.OpenSubtitlesApiKey;
        if (_token != null && _tokenFor == who && DateTime.UtcNow < _tokenExpires) return _token;
        await _loginLock.WaitAsync(ct);
        try
        {
            if (_token != null && _tokenFor == who && DateTime.UtcNow < _tokenExpires) return _token;
            using var req = Request(HttpMethod.Post, DefaultBase + "/login", m.OpenSubtitlesApiKey, null);
            req.Content = JsonContent.Create(new { username = m.OpenSubtitlesUsername, password = m.OpenSubtitlesPassword });
            using var res = await _http.SendAsync(req, ct);
            if (res.StatusCode == HttpStatusCode.Unauthorized)
                throw new UserFacingException("OpenSubtitles login failed. Check the username and password.");
            await ThrowIfFailed(res, ct);
            await using var s = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(s, cancellationToken: ct);
            _token = doc.RootElement.Str("token") ?? throw new UserFacingException("OpenSubtitles login returned no token.", 502);
            var host = doc.RootElement.Str("base_url");
            _base = string.IsNullOrEmpty(host) ? DefaultBase : "https://" + host.Replace("https://", "").TrimEnd('/') + "/api/v1";
            _tokenFor = who;
            _tokenExpires = DateTime.UtcNow.AddHours(20);
            return _token;
        }
        finally
        {
            _loginLock.Release();
        }
    }

    private static HttpRequestMessage Request(HttpMethod method, string url, string apiKey, string? token)
    {
        var req = new HttpRequestMessage(method, url);
        req.Headers.TryAddWithoutValidation("Api-Key", apiKey);
        req.Headers.UserAgent.ParseAdd("SeedboxSync v1.0.0");
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (token != null) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return req;
    }

    private static async Task ThrowIfFailed(HttpResponseMessage res, CancellationToken ct)
    {
        if (res.IsSuccessStatusCode) return;
        var body = await res.Content.ReadAsStringAsync(ct);
        var msg = res.StatusCode switch
        {
            HttpStatusCode.Forbidden or HttpStatusCode.Unauthorized => "OpenSubtitles rejected the API key or login.",
            HttpStatusCode.NotAcceptable => "OpenSubtitles download quota reached for today. Try again tomorrow.",
            HttpStatusCode.TooManyRequests => "OpenSubtitles is rate limiting requests. Try again in a minute.",
            _ => $"OpenSubtitles returned {(int)res.StatusCode}.",
        };
        throw new UserFacingException(msg + (body.Length is > 0 and < 200 ? " " + body : ""), 502);
    }
}

/// <summary>
/// What decides whether a subtitle lines up: the release group, the source (Blu-ray, web, TV),
/// the edition (extended, director's cut), the streaming service and the resolution.
/// </summary>
internal sealed record ReleaseTags(string? Group, string? Source, string? Service, string? Resolution, IReadOnlySet<string> Editions)
{
    private static readonly Dictionary<string, string> Sources = new(StringComparer.OrdinalIgnoreCase)
    {
        ["bluray"] = "bluray", ["blu-ray"] = "bluray", ["bdrip"] = "bluray", ["brrip"] = "bluray", ["bdremux"] = "bluray", ["remux"] = "bluray", ["bd"] = "bluray", ["uhd"] = "bluray",
        ["web"] = "web", ["webdl"] = "web", ["web-dl"] = "web", ["webrip"] = "web",
        ["hdtv"] = "tv", ["pdtv"] = "tv", ["dsr"] = "tv",
        ["dvdrip"] = "dvd", ["dvd"] = "dvd", ["dvdr"] = "dvd",
    };

    private static readonly HashSet<string> Services = new(StringComparer.OrdinalIgnoreCase)
    {
        "amzn", "nf", "dsnp", "hmax", "max", "atvp", "hulu", "pcok", "pmtp", "itunes", "it", "stan", "crav", "skst", "viap",
    };

    private static readonly HashSet<string> EditionWords = new(StringComparer.OrdinalIgnoreCase)
    {
        // Not "remastered": a remaster usually keeps the timing of the original release.
        "extended", "directors", "director", "unrated", "uncut", "theatrical", "imax", "final", "special",
    };

    private static readonly HashSet<string> Resolutions = new(StringComparer.OrdinalIgnoreCase) { "2160p", "1080p", "1080i", "720p", "576p", "480p" };

    /// <summary>True when the name says anything about the release (source or resolution).</summary>
    public bool HasTags => Source != null || Resolution != null;

    public static ReleaseTags Parse(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return new ReleaseTags(null, null, null, null, new HashSet<string>());
        // Strip only real file extensions: "…BluRay.x264-x0r" has no extension.
        var n = System.Text.RegularExpressions.Regex.Replace(name.Trim(), @"(?i)\.(mkv|mp4|m4v|avi|ts|m2ts|wmv|srt|sub|ass|ssa|vtt|zip)$", "");
        // "web-dl" and "blu-ray" are one tag; join them before splitting on punctuation.
        var joined = System.Text.RegularExpressions.Regex.Replace(n, "(?i)web[ ._-]dl", "webdl");
        joined = System.Text.RegularExpressions.Regex.Replace(joined, "(?i)blu[ ._-]ray", "bluray");
        var tokens = joined.Split(new[] { '.', ' ', '_', '-', '[', ']', '(', ')' }, StringSplitOptions.RemoveEmptyEntries);
        string? source = null, service = null, resolution = null;
        var editions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var t in tokens)
        {
            if (source == null && Sources.TryGetValue(t, out var src)) source = src;
            else if (service == null && Services.Contains(t)) service = t.ToLowerInvariant();
            else if (resolution == null && Resolutions.Contains(t)) resolution = t.ToLowerInvariant();
            else if (EditionWords.Contains(t)) editions.Add(t.StartsWith("director", StringComparison.OrdinalIgnoreCase) ? "directors" : t.ToLowerInvariant());
        }
        // Scene names end in "-GROUP"; ignore a trailing tag that is really a source or language.
        string? group = null;
        var dash = joined.LastIndexOf('-');
        if (dash > 0 && dash < joined.Length - 1)
        {
            var g = joined[(dash + 1)..].Split(new[] { '.', ' ', '[', '(' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
            if (g != null && g.Length >= 2 && !Sources.ContainsKey(g) && !Resolutions.Contains(g)) group = g.ToLowerInvariant();
        }
        return new ReleaseTags(group, source, service, resolution, editions);
    }

    /// <summary>Higher is closer. Group and source matter most for timing.</summary>
    public int Similarity(ReleaseTags other)
    {
        var score = 0;
        if (Group != null && Group == other.Group) score += 8;
        if (Source != null && other.Source != null) score += Source == other.Source ? 4 : -4;
        if (Service != null && Service == other.Service) score += 2;
        if (Editions.Count > 0 || other.Editions.Count > 0) score += Editions.SetEquals(other.Editions) ? 3 : -3;
        if (Resolution != null && Resolution == other.Resolution) score += 1;
        return score;
    }
}
