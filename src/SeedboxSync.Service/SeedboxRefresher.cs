using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Service;

/// <summary>Lists the seedbox at startup, after settings change, and every N minutes (Settings).</summary>
public sealed class SeedboxRefresher : BackgroundService
{
    private readonly SeedboxCatalog _catalog;
    private readonly SettingsStore _settings;
    private readonly ILogger<SeedboxRefresher> _log;
    private readonly SemaphoreSlim _wake = new(0, 1);

    public SeedboxRefresher(SeedboxCatalog catalog, SettingsStore settings, ILogger<SeedboxRefresher> log)
    {
        _catalog = catalog;
        _settings = settings;
        _log = log;
        _settings.Changed += _ =>
        {
            _catalog.ResetIfRootChanged();
            Wake();
        };
    }

    public void Wake()
    {
        try { _wake.Release(); }
        catch (SemaphoreFullException) { }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_settings.Current.Seedbox.IsConfigured)
            {
                try
                {
                    await _catalog.RefreshAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _log.LogInformation("Scheduled seedbox refresh failed: {Message}", ex.Message);
                }
            }

            var minutes = _settings.Current.Seedbox.RefreshMinutes;
            var delay = minutes > 0 ? TimeSpan.FromMinutes(minutes) : Timeout.InfiniteTimeSpan;
            try
            {
                await _wake.WaitAsync(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
