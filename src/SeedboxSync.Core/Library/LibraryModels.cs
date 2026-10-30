using SeedboxSync.Core.Metadata;

namespace SeedboxSync.Core.Library;

public enum MatchStatus
{
    Matched,
    Review,
    Unmatched,
}

/// <summary>What we know about a title, persisted per media server in library/{server}.json.</summary>
public sealed class TitleMeta
{
    public string Provider { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? Credit { get; set; }
    public string? Overview { get; set; }
    public int? RuntimeMinutes { get; set; }
    public string? ImdbId { get; set; }
    public string? TmdbId { get; set; }
    public List<string> Genres { get; set; } = new();
    public MatchStatus Status { get; set; } = MatchStatus.Unmatched;
    public int Confidence { get; set; }
    public string? Note { get; set; }
    public bool HasPoster { get; set; }
    public bool HasBackdrop { get; set; }
    public List<EpisodeInfo> Episodes { get; set; } = new();
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;

    /// <summary>TMDB collection (e.g. "The Terminator Collection"). Movies only.</summary>
    public string? CollectionId { get; set; }
    public string? CollectionName { get; set; }

    /// <summary>When the provider was last asked for episodes (series) or the collection (movies).</summary>
    public DateTime? CheckedUtc { get; set; }
}

public sealed class LibraryIndexFile
{
    public Dictionary<string, TitleMeta> Titles { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

// ---- API shapes -------------------------------------------------------------------------

public sealed record MatchDto(
    string Provider,
    string? ProviderId,
    string? Title,
    int? Year,
    string? Credit,
    MatchStatus Status,
    int Confidence,
    string? Note,
    string? Overview,
    int? RuntimeMinutes);

public sealed record TitleDto(
    string Key,
    string Name,
    MediaKind Kind,
    string Category,
    string DisplayTitle,
    int? Year,
    long Size,
    int Have,
    int Total,
    bool OnSeedbox,
    MatchDto Match,
    bool HasPoster,
    bool HasBackdrop,
    string? MainFile,
    IReadOnlyList<string> Subtitles,
    int? Seasons,
    int? Episodes,
    DateTime? AddedUtc = null,
    DateTime? LastPlayedUtc = null,
    EpisodeRefDto? UpNext = null,
    IReadOnlyList<EpisodeRefDto>? NewEpisodes = null,
    int Missing = 0,
    string? NextAirs = null,
    string? CollectionId = null,
    string? Collection = null,
    IReadOnlyList<string>? Duplicates = null);

/// <summary>An episode referred to from a title card: up next, or newly released.</summary>
public sealed record EpisodeRefDto(string Key, string? Path, int Season, int Episode, string Title, bool Available, bool OnSeedbox, string? SeedboxPath, string? Aired);

/// <summary>A newly released episode of a series you have, for the notification.</summary>
public sealed record NewsItemDto(string ServerId, string ServerName, string TitleKey, string Title, EpisodeRefDto Episode);

public sealed record LibraryDto(
    string ServerId,
    string ServerName,
    string LibraryRoot,
    DateTime? ScannedUtc,
    bool Matching,
    IReadOnlyList<TitleDto> Titles);

public sealed record EpisodeDto(
    string Key,
    int Season,
    int Episode,
    string Title,
    int? RuntimeMinutes,
    long Size,
    string? Path,
    string? SeedboxPath,
    bool Available,
    bool OnSeedbox,
    IReadOnlyList<SubtitleTrackDto> Subtitles,
    bool Watched = false,
    string? Aired = null,
    bool New = false, // released after the newest episode you have
    bool Missing = false, // released, older than the newest episode you have, not on this server
    bool Upcoming = false); // announced by the provider, not released yet (Aired is the date, or null if not set)

public sealed record SeasonDto(int Number, IReadOnlyList<EpisodeDto> Episodes);

/// <summary>A subtitle for a video: a file next to it, or (<c>Embedded</c>) a track inside it.</summary>
public sealed record SubtitleTrackDto(string Language, string Label, string Path, bool Embedded = false);

public sealed record TitleDetailDto(
    TitleDto Title,
    string LocalPath,
    string? SeedboxPath,
    IReadOnlyList<SeasonDto> Seasons,
    IReadOnlyList<string> Parts,
    IReadOnlyList<SubtitleTrackDto> SubtitleTracks,
    IReadOnlyList<string> Sidecars);

public sealed record ScanResultDto(int Titles, int NeedReview, int Unmatched, int Queued);

/// <summary>Subtitle search for one video: what was searched with, and the results best first.</summary>
public sealed record SubtitleSearchDto(string VideoPath, string? Release, bool Hashed, IReadOnlyList<Subtitles.SubtitleCandidate> Candidates);

/// <summary><c>Exact</c>: how many of the found subtitles were made for these exact files (in sync).</summary>
public sealed record SubtitleResultDto(int Found, IReadOnlyList<string> Languages, int Files, int Exact = 0);
