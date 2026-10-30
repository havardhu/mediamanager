using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace SeedboxSync.Core.Library;

public enum MediaKind
{
    Movie,
    Tv,
    Audiobook,
    Other,
}

/// <summary>Parsing of seedbox-style folder and file names. File names are never changed.</summary>
public static partial class MediaNames
{
    public static readonly HashSet<string> VideoExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".mkv", ".mp4", ".m4v", ".avi", ".mov", ".webm", ".ts", ".m2ts", ".wmv", ".mpg", ".mpeg" };

    public static readonly HashSet<string> AudioExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".m4b", ".m4a", ".mp3", ".aac", ".flac", ".ogg", ".opus", ".wma" };

    public static readonly HashSet<string> SubtitleExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".srt", ".vtt", ".ass", ".ssa", ".sub" };

    public static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".webp" };

    public static bool IsVideo(string path) => VideoExtensions.Contains(Path.GetExtension(path));
    public static bool IsAudio(string path) => AudioExtensions.Contains(Path.GetExtension(path));
    public static bool IsSubtitle(string path) => SubtitleExtensions.Contains(Path.GetExtension(path));
    public static bool IsImage(string path) => ImageExtensions.Contains(Path.GetExtension(path));
    public static bool IsMedia(string path) => IsVideo(path) || IsAudio(path);

    public static bool IsSample(string path) =>
        path.Contains("sample", StringComparison.OrdinalIgnoreCase) && IsVideo(path);

    /// <summary>Guesses what a top-level category folder holds from its name.</summary>
    public static MediaKind KindOfCategory(string folder)
    {
        var f = folder.ToLowerInvariant();
        if (f.Contains("audiobook") || f.Contains("lydbok") || f == "books" || f.Contains("audio book")) return MediaKind.Audiobook;
        if (f.Contains("tv") || f.Contains("series") || f.Contains("show") || f.Contains("serier")) return MediaKind.Tv;
        if (f.Contains("movie") || f.Contains("film") || f.Contains("cinema")) return MediaKind.Movie;
        return MediaKind.Other;
    }

    [GeneratedRegex(@"(?<![0-9])(19[0-9]{2}|20[0-9]{2})(?![0-9])")]
    private static partial Regex YearRegex();

    [GeneratedRegex(@"\b(2160p|1080p|1080i|720p|576p|480p|4k|uhd|web[- .]?dl|webrip|bluray|blu[- .]?ray|bdrip|brrip|hdrip|dvdrip|hdtv|remux|x264|x265|h\.?264|h\.?265|hevc|avc|hdr10?|dolby|atmos|ddp?5\.1|aac|ac3|dts|proper|repack|extended|unrated|imax|nordic)\b", RegexOptions.IgnoreCase)]
    private static partial Regex QualityRegex();

    [GeneratedRegex(@"[Ss](\d{1,2})[ ._-]?[Ee](\d{1,3})")]
    private static partial Regex SxxEyyRegex();

    [GeneratedRegex(@"(?<![0-9])(\d{1,2})x(\d{2,3})(?![0-9])")]
    private static partial Regex NxNNRegex();

    [GeneratedRegex(@"^(?:season|sesong|s)[ ._-]?(\d{1,2})$", RegexOptions.IgnoreCase)]
    private static partial Regex SeasonFolderRegex();

    [GeneratedRegex(@"(?:^|[ ._-])[Ee](?:p|pisode)?[ ._-]?(\d{1,3})(?![0-9])")]
    private static partial Regex EpisodeOnlyRegex();

    /// <summary>"Dune Part Two (2024)" → ("Dune Part Two", 2024); "aftersun.2022.1080p.BluRay" → ("aftersun", 2022).</summary>
    public static (string Title, int? Year) ParseTitle(string name)
    {
        var n = name;
        var ext = Path.GetExtension(n);
        if (ext.Length is > 1 and <= 5 && (IsMedia(n) || IsSubtitle(n))) n = n[..^ext.Length];

        // Dotted scene names: "The.Bear.2022.S01" → spaces.
        if (!n.Contains(' ') && (n.Count(c => c == '.') >= 2 || n.Contains('_')))
            n = n.Replace('.', ' ').Replace('_', ' ');

        int? year = null;
        var cut = n.Length;
        var years = YearRegex().Matches(n);
        // Use the last year that is not at the very start (titles like "2001 A Space Odyssey").
        foreach (Match m in years)
        {
            if (m.Index == 0) continue;
            year = int.Parse(m.Value, CultureInfo.InvariantCulture);
            cut = Math.Min(cut, m.Index);
        }
        var q = QualityRegex().Match(n);
        if (q.Success && q.Index > 0) cut = Math.Min(cut, q.Index);
        var se = SxxEyyRegex().Match(n);
        if (se.Success && se.Index > 0) cut = Math.Min(cut, se.Index);
        var sOnly = Regex.Match(n, @"\b[Ss]\d{2}\b");
        if (sOnly.Success && sOnly.Index > 0) cut = Math.Min(cut, sOnly.Index);

        var title = n[..cut].Trim(' ', '-', '(', '[', '.', '_');
        title = Regex.Replace(title, @"\s{2,}", " ");
        if (title.Length == 0) title = n.Trim();
        return (title, year);
    }

    /// <summary>"Andy Weir - Project Hail Mary" → ("Project Hail Mary", "Andy Weir").</summary>
    public static (string Title, string? Author) ParseAudiobook(string name)
    {
        var (t, _) = ParseTitle(name);
        var i = t.IndexOf(" - ", StringComparison.Ordinal);
        if (i > 0) return (t[(i + 3)..].Trim(), t[..i].Trim());
        return (t, null);
    }

    /// <summary>Season and episode number from a file name, using the season folder as a fallback.</summary>
    public static (int Season, int Episode)? ParseEpisode(string fileName, string? seasonFolder)
    {
        var m = SxxEyyRegex().Match(fileName);
        if (m.Success) return (int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture), int.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture));
        m = NxNNRegex().Match(fileName);
        if (m.Success) return (int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture), int.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture));
        var season = ParseSeasonFolder(seasonFolder);
        m = EpisodeOnlyRegex().Match(Path.GetFileNameWithoutExtension(fileName));
        if (season != null && m.Success) return (season.Value, int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture));
        return null;
    }

    public static int? ParseSeasonFolder(string? folder)
    {
        if (string.IsNullOrEmpty(folder)) return null;
        var m = SeasonFolderRegex().Match(folder.Trim());
        return m.Success ? int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) : null;
    }

    /// <summary>Language code from a subtitle file name: "Movie.en.srt" → "en", "Movie.srt" → "".</summary>
    public static string SubtitleLanguage(string subtitlePath, string videoPath)
    {
        var sub = Path.GetFileNameWithoutExtension(subtitlePath);
        var vid = Path.GetFileNameWithoutExtension(videoPath);
        if (!sub.StartsWith(vid, StringComparison.OrdinalIgnoreCase)) return string.Empty;
        var rest = sub[vid.Length..].Trim('.', ' ', '_', '-');
        if (rest.Length == 0) return string.Empty;
        var first = rest.Split('.', ' ', '_', '-')[0].ToLowerInvariant();
        return first switch
        {
            "eng" or "english" => "en",
            "nor" or "nob" or "nb" or "norwegian" or "norsk" => "no",
            "swe" or "swedish" => "sv",
            "dan" or "danish" => "da",
            "ger" or "deu" or "german" => "de",
            "fre" or "fra" or "french" => "fr",
            "spa" or "spanish" => "es",
            _ => first.Length <= 3 ? first : string.Empty,
        };
    }

    /// <summary>Lower case, no accents or punctuation; used to compare titles.</summary>
    public static string Simplify(string s)
    {
        var d = s.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(d.Length);
        foreach (var c in d)
        {
            var cat = CharUnicodeInfo.GetUnicodeCategory(c);
            if (cat == UnicodeCategory.NonSpacingMark) continue;
            if (char.IsLetterOrDigit(c)) sb.Append(char.ToLowerInvariant(c));
            else if (sb.Length > 0 && sb[^1] != ' ') sb.Append(' ');
        }
        var r = sb.ToString().Trim();
        if (r.StartsWith("the ", StringComparison.Ordinal)) r = r[4..];
        return r.Replace(" and ", " ").Replace(" part ", " ");
    }

    /// <summary>0..1 similarity between two titles (Levenshtein on simplified strings).</summary>
    public static double Similarity(string a, string b)
    {
        a = Simplify(a);
        b = Simplify(b);
        if (a.Length == 0 || b.Length == 0) return 0;
        if (a == b) return 1;
        var d = new int[a.Length + 1, b.Length + 1];
        for (var i = 0; i <= a.Length; i++) d[i, 0] = i;
        for (var j = 0; j <= b.Length; j++) d[0, j] = j;
        for (var i = 1; i <= a.Length; i++)
        {
            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
            }
        }
        return 1.0 - (double)d[a.Length, b.Length] / Math.Max(a.Length, b.Length);
    }

    public static string LanguageName(string code) => code switch
    {
        "en" => "English",
        "no" or "nb" => "Norwegian",
        "sv" => "Swedish",
        "da" => "Danish",
        "de" => "German",
        "fr" => "French",
        "es" => "Spanish",
        "fi" => "Finnish",
        "nl" => "Dutch",
        "it" => "Italian",
        "pt" => "Portuguese",
        "pl" => "Polish",
        "ja" => "Japanese",
        "ko" => "Korean",
        "zh" => "Chinese",
        "" => "Unknown",
        _ => code,
    };
}
