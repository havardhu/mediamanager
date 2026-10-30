using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Service.Endpoints;

public static class StatusEndpoints
{
    public static void MapStatusEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/status", (SeedboxCatalog catalog, SettingsStore settings, AppPaths paths, IConfiguration config) =>
        {
            var s = settings.Current.Seedbox;
            var st = catalog.Status;
            return Results.Ok(new
            {
                service = new
                {
                    name = ServiceInfo.ServiceName,
                    version = ServiceInfo.Version,
                    isWindowsService = ServiceInfo.IsWindowsService,
                    urls = (config["Kestrel:Endpoints:Ui:Url"] ?? config["Urls"] ?? "http://127.0.0.1:8742").Split(';', StringSplitOptions.RemoveEmptyEntries),
                    dataDirectory = paths.DataDirectory,
                    machineName = Environment.MachineName,
                },
                seedbox = new
                {
                    configured = st.Configured,
                    connected = st.Connected,
                    refreshing = st.Refreshing,
                    error = st.Error,
                    refreshedUtc = st.RefreshedUtc,
                    protocol = s.Protocol,
                    host = s.Host,
                    mediaRoot = s.MediaRoot,
                },
            });
        });

        api.MapPost("/service/restart", () =>
        {
            if (!ServiceInfo.IsWindowsService)
                throw new UserFacingException("Restart works when Seedbox Sync runs as a Windows service. Stop and start the console app instead.");
            // The service is installed with "restart on failure"; exiting non-zero makes Windows start it again.
            _ = Task.Run(async () =>
            {
                await Task.Delay(750);
                Environment.Exit(1);
            });
            return Results.Ok(new { message = "Service restarting. Transfers resume where they stopped." });
        });
    }
}
