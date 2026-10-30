using System.Text.Json.Serialization;

namespace SeedboxSync.Core.Configuration;

public enum SeedboxProtocol
{
    Ftp,
    Ftps,
    Sftp,
}

/// <summary>Everything the user edits on the Settings tab. Persisted to settings.json.</summary>
public sealed class AppSettings
{
    public SeedboxSettings Seedbox { get; set; } = new();
    public TransferSettings Transfers { get; set; } = new();
    public MetadataSettings Metadata { get; set; } = new();

    public AppSettings Clone() => new()
    {
        Seedbox = Seedbox with { },
        Transfers = Transfers with { },
        Metadata = Metadata with { },
    };
}

public sealed record SeedboxSettings
{
    public SeedboxProtocol Protocol { get; set; } = SeedboxProtocol.Sftp;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 22;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    /// <summary>Absolute path on the seedbox, e.g. /home/rob/media. The seedbox owns the folder structure below it.</summary>
    public string MediaRoot { get; set; } = string.Empty;

    /// <summary>
    /// Your storage quota on the seedbox in TB (decimal, e.g. 1.5). When set it overrides the disk
    /// size the server reports, which on shared seedboxes is the whole disk rather than your share.
    /// Null means "use what the server reports".
    /// </summary>
    public double? QuotaTb { get; set; }

    /// <summary>Accept self-signed certificates for FTPS. Most seedboxes use one.</summary>
    public bool AcceptAnyCertificate { get; set; } = true;

    /// <summary>Minutes between automatic listings of the seedbox. 0 turns it off.</summary>
    public int RefreshMinutes { get; set; } = 10;

    [JsonIgnore]
    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host) && !string.IsNullOrWhiteSpace(MediaRoot);
}

public sealed record TransferSettings
{
    public int Parallel { get; set; } = 3;
}

public sealed record MetadataSettings
{
    /// <summary>TMDB v3 API key or v4 read access token.</summary>
    public string TmdbApiKey { get; set; } = string.Empty;
    public string TvdbApiKey { get; set; } = string.Empty;
    public string OpenSubtitlesApiKey { get; set; } = string.Empty;
    public string OpenSubtitlesUsername { get; set; } = string.Empty;
    public string OpenSubtitlesPassword { get; set; } = string.Empty;
    public string SubtitleLanguages { get; set; } = "en";
    public bool WriteSidecars { get; set; } = true;

    /// <summary>OMDb key (omdbapi.com) for IMDb, Rotten Tomatoes and Metacritic ratings. Optional.</summary>
    public string OmdbApiKey { get; set; } = string.Empty;

    /// <summary>Where series are matched: "auto" (TVDB when it has a key, else TMDB), "tmdb" or "tvdb".</summary>
    public string TvProvider { get; set; } = "auto";

    [JsonIgnore]
    public IReadOnlyList<string> LanguageList => SubtitleLanguages
        .Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries)
        .Select(l => l.Trim().ToLowerInvariant())
        .Distinct()
        .ToList();
}
