using SeedboxSync.Core.Common;

namespace SeedboxSync.Core.Configuration;

/// <summary>Loads and saves settings.json. Secrets are encrypted on disk and plain in memory.</summary>
public sealed class SettingsStore
{
    private readonly AppPaths _paths;
    private readonly object _lock = new();
    private AppSettings _current;

    public SettingsStore(AppPaths paths)
    {
        _paths = paths;
        _current = Load();
    }

    /// <summary>Raised after a successful save with the new settings.</summary>
    public event Action<AppSettings>? Changed;

    public AppSettings Current
    {
        get { lock (_lock) return _current.Clone(); }
    }

    public void Save(AppSettings settings)
    {
        Validate(settings);
        lock (_lock)
        {
            var onDisk = settings.Clone();
            onDisk.Seedbox.Password = SecretProtector.Protect(settings.Seedbox.Password);
            onDisk.Metadata.TmdbApiKey = SecretProtector.Protect(settings.Metadata.TmdbApiKey);
            onDisk.Metadata.TvdbApiKey = SecretProtector.Protect(settings.Metadata.TvdbApiKey);
            onDisk.Metadata.OpenSubtitlesApiKey = SecretProtector.Protect(settings.Metadata.OpenSubtitlesApiKey);
            onDisk.Metadata.OpenSubtitlesPassword = SecretProtector.Protect(settings.Metadata.OpenSubtitlesPassword);
            onDisk.Metadata.OmdbApiKey = SecretProtector.Protect(settings.Metadata.OmdbApiKey);
            JsonFileStore.Write(_paths.SettingsFile, onDisk);
            _current = settings.Clone();
        }
        Changed?.Invoke(Current);
    }

    private AppSettings Load()
    {
        var s = JsonFileStore.Read<AppSettings>(_paths.SettingsFile) ?? new AppSettings();
        s.Seedbox ??= new SeedboxSettings();
        s.Transfers ??= new TransferSettings();
        s.Metadata ??= new MetadataSettings();
        s.Seedbox.Password = SecretProtector.Unprotect(s.Seedbox.Password);
        s.Metadata.TmdbApiKey = SecretProtector.Unprotect(s.Metadata.TmdbApiKey);
        s.Metadata.TvdbApiKey = SecretProtector.Unprotect(s.Metadata.TvdbApiKey);
        s.Metadata.OpenSubtitlesApiKey = SecretProtector.Unprotect(s.Metadata.OpenSubtitlesApiKey);
        s.Metadata.OpenSubtitlesPassword = SecretProtector.Unprotect(s.Metadata.OpenSubtitlesPassword);
        s.Metadata.OmdbApiKey = SecretProtector.Unprotect(s.Metadata.OmdbApiKey);
        return s;
    }

    private static void Validate(AppSettings s)
    {
        if (s.Seedbox.Port is < 1 or > 65535)
            throw new UserFacingException("Port must be between 1 and 65535.");
        if (s.Transfers.Parallel is < 1 or > 16)
            throw new UserFacingException("Parallel transfers must be between 1 and 16.");
        if (!string.IsNullOrWhiteSpace(s.Seedbox.MediaRoot) && !s.Seedbox.MediaRoot.Trim().StartsWith('/'))
            throw new UserFacingException("The media root must be an absolute path on the seedbox, starting with /.");
        s.Seedbox.Host = s.Seedbox.Host.Trim();
        s.Seedbox.MediaRoot = s.Seedbox.MediaRoot.Trim();
        if (s.Seedbox.MediaRoot.Length > 1) s.Seedbox.MediaRoot = s.Seedbox.MediaRoot.TrimEnd('/');
        if (s.Seedbox.RefreshMinutes < 0) s.Seedbox.RefreshMinutes = 0;
        if (s.Seedbox.QuotaTb is { } q && (double.IsNaN(q) || q <= 0)) s.Seedbox.QuotaTb = null;
        if (s.Seedbox.QuotaTb is > 1000) throw new UserFacingException("The quota is in TB. Enter a value such as 1.5.");
    }
}
