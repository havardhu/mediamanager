using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Hosting.WindowsServices;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;
using SeedboxSync.Core.Discover;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Metadata;
using SeedboxSync.Core.Nodes;
using SeedboxSync.Core.Peers;
using SeedboxSync.Core.Seedbox;
using SeedboxSync.Core.Subtitles;
using SeedboxSync.Core.Transfers;
using SeedboxSync.Service;
using SeedboxSync.Service.Endpoints;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // As a Windows service the working directory is System32; serve files from the install folder.
    ContentRootPath = WindowsServiceHelpers.IsWindowsService() ? AppContext.BaseDirectory : null,
});

// Runs as a console app too (dotnet run); as a service it logs to the Windows event log.
builder.Host.UseWindowsService(o => o.ServiceName = ServiceInfo.ServiceName);

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

// Core services. Everything is a singleton: the service is one process with in-memory state
// backed by JSON files in the data directory.
var paths = new AppPaths(builder.Configuration["DataDirectory"]);
builder.Services.AddSingleton(paths);

// LAN: the UI stays on 127.0.0.1 (Kestrel:Endpoints:Ui); other PCs running Seedbox Sync reach
// this one over HTTPS on Kestrel:Endpoints:Peer with a self-signed certificate that they pin when
// they pair. Remove the Peer endpoint from appsettings.json to keep this PC off the network.
var peerUrl = builder.Configuration["Kestrel:Endpoints:Peer:Url"];
var peerPort = Regex.Match(peerUrl ?? string.Empty, @":(\d+)/?$") is { Success: true } m ? int.Parse(m.Groups[1].Value) : PeerProtocol.DefaultPort;
var peerOptions = new PeerOptions
{
    Enabled = !string.IsNullOrWhiteSpace(peerUrl),
    Port = peerPort,
    DiscoveryPort = builder.Configuration.GetValue("Peer:DiscoveryPort", PeerProtocol.DefaultDiscoveryPort),
};
var peerCertificate = new PeerCertificate(paths);
builder.WebHost.ConfigureKestrel(k => k.ConfigureHttpsDefaults(h => h.ServerCertificate = peerCertificate.Certificate));
builder.Services.AddSingleton(peerOptions);
builder.Services.AddSingleton(peerCertificate);
builder.Services.AddSingleton<InstanceIdentity>();
builder.Services.AddSingleton<PairingService>();
builder.Services.AddSingleton<DiscoveryService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<DiscoveryService>());
builder.Services.AddSingleton<SettingsStore>();
builder.Services.AddSingleton<ISeedboxClientFactory, SeedboxClientFactory>();
builder.Services.AddSingleton<SeedboxCatalog>();
builder.Services.AddSingleton<MediaServerRegistry>();
builder.Services.AddSingleton<InventoryService>();
builder.Services.AddSingleton<LibraryIndex>();
builder.Services.AddSingleton<WatchHistory>();
builder.Services.AddSingleton(_ => new HttpClient(new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(10),
    AutomaticDecompression = DecompressionMethods.All,
})
{
    Timeout = TimeSpan.FromSeconds(60),
    DefaultRequestHeaders = { { "User-Agent", "SeedboxSync/1.0" } },
});
builder.Services.AddSingleton<TmdbProvider>();
builder.Services.AddSingleton<TvdbProvider>();
builder.Services.AddSingleton<IMetadataProvider>(sp => sp.GetRequiredService<TmdbProvider>());
builder.Services.AddSingleton<IMetadataProvider>(sp => sp.GetRequiredService<TvdbProvider>());
builder.Services.AddSingleton<OpenSubtitlesClient>();
builder.Services.AddSingleton<TmdbBrowser>();
builder.Services.AddSingleton<OmdbClient>();
builder.Services.AddSingleton<WantedList>();

builder.Services.AddSingleton<TransferQueue>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<TransferQueue>());
builder.Services.AddSingleton<LibraryService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<LibraryService>());
builder.Services.AddSingleton<SeedboxRefresher>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<SeedboxRefresher>());

// Future TV app (Tizen) or remote browsers: list allowed origins in appsettings.json → Cors:Origins.
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
if (origins.Length > 0)
{
    builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
}

var app = builder.Build();

app.UseMiddleware<ErrorMiddleware>();
app.UseMiddleware<PeerGuardMiddleware>();
if (origins.Length > 0) app.UseCors();
// index.html must never be cached, or a browser keeps showing an old UI after an update. The
// files under /assets have content hashes in their names, so they can be cached for good.
var staticFiles = new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var headers = ctx.Context.Response.Headers;
        if (ctx.File.Name.Equals("index.html", StringComparison.OrdinalIgnoreCase))
            headers.CacheControl = "no-cache, no-store, must-revalidate";
        else if (ctx.Context.Request.Path.StartsWithSegments("/assets"))
            headers.CacheControl = "public, max-age=31536000, immutable";
    },
};
app.UseDefaultFiles();
app.UseStaticFiles(staticFiles);

var api = app.MapGroup("/api");
api.MapStatusEndpoints();
api.MapSettingsEndpoints();
api.MapSeedboxEndpoints();
api.MapTransferEndpoints();
api.MapServerEndpoints();
api.MapLibraryEndpoints();
api.MapMediaEndpoints();
api.MapPairingEndpoints();
api.MapDiscoverEndpoints();
api.MapCalendarEndpoints();
app.MapPeerEndpoints();

app.MapFallbackToFile("index.html", staticFiles);

app.Run();
