using System.Text.Json;
using SeedboxSync.Core.Library;

namespace SeedboxSync.Core.Metadata;

public sealed record MetadataCandidate(
    string Provider,
    string Id,
    string Title,
    int? Year,
    string? Credit,
    string? PosterUrl,
    double Popularity)
{
    /// <summary>0–100 similarity to the searched title and year, filled in by the library service.</summary>
    public int Score { get; init; }
}

/// <summary>An episode from TVDB/TMDB. <c>Aired</c> is the first air date as yyyy-MM-dd, when known.</summary>
public sealed record EpisodeInfo(int Season, int Episode, string Title, int? RuntimeMinutes, string? Aired = null);

public sealed record MetadataDetails(
    string Provider,
    string Id,
    string Title,
    int? Year,
    string? Credit,
    string? Overview,
    int? RuntimeMinutes,
    string? PosterUrl,
    string? BackdropUrl,
    string? ImdbId,
    string? TmdbId,
    IReadOnlyList<string> Genres,
    IReadOnlyList<EpisodeInfo> Episodes,
    string? CollectionId = null,
    string? CollectionName = null);

public interface IMetadataProvider
{
    /// <summary>"TMDB" or "TVDB".</summary>
    string Name { get; }

    bool IsConfigured { get; }

    bool Supports(MediaKind kind);

    Task<IReadOnlyList<MetadataCandidate>> SearchAsync(MediaKind kind, string query, int? year, CancellationToken ct);

    Task<MetadataDetails> GetDetailsAsync(MediaKind kind, string id, CancellationToken ct);
}

/// <summary>Tolerant JSON helpers: provider APIs omit and null fields freely.</summary>
internal static class J
{
    public static JsonElement? Prop(this JsonElement e, string name)
    {
        if (e.ValueKind != JsonValueKind.Object) return null;
        if (!e.TryGetProperty(name, out var v) || v.ValueKind == JsonValueKind.Null) return null;
        return v;
    }

    public static string? Str(this JsonElement e, string name)
    {
        var v = e.Prop(name);
        if (v is null) return null;
        return v.Value.ValueKind switch
        {
            JsonValueKind.String => v.Value.GetString(),
            JsonValueKind.Number => v.Value.GetRawText(),
            _ => null,
        };
    }

    public static int? Int(this JsonElement e, string name)
    {
        var v = e.Prop(name);
        if (v is null) return null;
        if (v.Value.ValueKind == JsonValueKind.Number && v.Value.TryGetInt32(out var i)) return i;
        if (v.Value.ValueKind == JsonValueKind.String && int.TryParse(v.Value.GetString(), out i)) return i;
        return null;
    }

    public static double Dbl(this JsonElement e, string name)
    {
        var v = e.Prop(name);
        if (v is { ValueKind: JsonValueKind.Number } n && n.TryGetDouble(out var d)) return d;
        return 0;
    }

    public static IEnumerable<JsonElement> Arr(this JsonElement e, string name)
    {
        var v = e.Prop(name);
        if (v is { ValueKind: JsonValueKind.Array } a) return a.EnumerateArray();
        return Enumerable.Empty<JsonElement>();
    }

    public static int? YearOf(string? date)
    {
        if (string.IsNullOrEmpty(date) || date.Length < 4) return null;
        return int.TryParse(date[..4], out var y) ? y : null;
    }
}
