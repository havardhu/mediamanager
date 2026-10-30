using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Service.Endpoints;

/// <summary>
/// Settings as the UI sees them. Secrets are never sent back: the GET returns empty strings plus
/// "...Set" flags, and on PUT a null secret means "keep the saved value".
/// </summary>
public sealed record SeedboxSettingsDto(
    SeedboxProtocol Protocol,
    string Host,
    int Port,
    string Username,
    string? Password,
    bool PasswordSet,
    string MediaRoot,
    double? QuotaTb,
    bool AcceptAnyCertificate,
    int RefreshMinutes);

public sealed record TransferSettingsDto(int Parallel);

public sealed record MetadataSettingsDto(
    string? TmdbApiKey,
    bool TmdbApiKeySet,
    string? TvdbApiKey,
    bool TvdbApiKeySet,
    string? OpenSubtitlesApiKey,
    bool OpenSubtitlesApiKeySet,
    string OpenSubtitlesUsername,
    string? OpenSubtitlesPassword,
    bool OpenSubtitlesPasswordSet,
    string SubtitleLanguages,
    bool WriteSidecars,
    string? OmdbApiKey = null,
    bool OmdbApiKeySet = false,
    string TvProvider = "auto");

public sealed record SettingsDto(SeedboxSettingsDto Seedbox, TransferSettingsDto Transfers, MetadataSettingsDto Metadata);

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/settings", (SettingsStore store) => ToDto(store.Current));

        api.MapPut("/settings", (SettingsDto dto, SettingsStore store) =>
        {
            var merged = Merge(store.Current, dto);
            store.Save(merged);
            return ToDto(store.Current);
        });

        api.MapPost("/settings/test", async (SettingsDto dto, SettingsStore store, SeedboxCatalog catalog, CancellationToken ct) =>
        {
            var merged = Merge(store.Current, dto);
            return await catalog.TestAsync(merged.Seedbox, ct);
        });
    }

    private static SettingsDto ToDto(AppSettings s) => new(
        new SeedboxSettingsDto(
            s.Seedbox.Protocol, s.Seedbox.Host, s.Seedbox.Port, s.Seedbox.Username, "", s.Seedbox.Password.Length > 0,
            s.Seedbox.MediaRoot, s.Seedbox.QuotaTb, s.Seedbox.AcceptAnyCertificate, s.Seedbox.RefreshMinutes),
        new TransferSettingsDto(s.Transfers.Parallel),
        new MetadataSettingsDto(
            "", s.Metadata.TmdbApiKey.Length > 0,
            "", s.Metadata.TvdbApiKey.Length > 0,
            "", s.Metadata.OpenSubtitlesApiKey.Length > 0,
            s.Metadata.OpenSubtitlesUsername,
            "", s.Metadata.OpenSubtitlesPassword.Length > 0,
            s.Metadata.SubtitleLanguages,
            s.Metadata.WriteSidecars,
            "", s.Metadata.OmdbApiKey.Length > 0,
            s.Metadata.TvProvider));

    private static AppSettings Merge(AppSettings current, SettingsDto dto)
    {
        var s = current.Clone();
        s.Seedbox.Protocol = dto.Seedbox.Protocol;
        s.Seedbox.Host = dto.Seedbox.Host ?? "";
        s.Seedbox.Port = dto.Seedbox.Port;
        s.Seedbox.Username = dto.Seedbox.Username ?? "";
        if (dto.Seedbox.Password != null) s.Seedbox.Password = dto.Seedbox.Password;
        s.Seedbox.MediaRoot = dto.Seedbox.MediaRoot ?? "";
        s.Seedbox.QuotaTb = dto.Seedbox.QuotaTb;
        s.Seedbox.AcceptAnyCertificate = dto.Seedbox.AcceptAnyCertificate;
        s.Seedbox.RefreshMinutes = dto.Seedbox.RefreshMinutes;
        s.Transfers.Parallel = dto.Transfers.Parallel;
        if (dto.Metadata.TmdbApiKey != null) s.Metadata.TmdbApiKey = dto.Metadata.TmdbApiKey.Trim();
        if (dto.Metadata.TvdbApiKey != null) s.Metadata.TvdbApiKey = dto.Metadata.TvdbApiKey.Trim();
        if (dto.Metadata.OpenSubtitlesApiKey != null) s.Metadata.OpenSubtitlesApiKey = dto.Metadata.OpenSubtitlesApiKey.Trim();
        s.Metadata.OpenSubtitlesUsername = dto.Metadata.OpenSubtitlesUsername ?? "";
        if (dto.Metadata.OpenSubtitlesPassword != null) s.Metadata.OpenSubtitlesPassword = dto.Metadata.OpenSubtitlesPassword;
        s.Metadata.SubtitleLanguages = dto.Metadata.SubtitleLanguages ?? "";
        s.Metadata.WriteSidecars = dto.Metadata.WriteSidecars;
        if (dto.Metadata.OmdbApiKey != null) s.Metadata.OmdbApiKey = dto.Metadata.OmdbApiKey.Trim();
        s.Metadata.TvProvider = dto.Metadata.TvProvider is "tmdb" or "tvdb" ? dto.Metadata.TvProvider : "auto";
        return s;
    }
}
