using SeedboxSync.Core.Common;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Service.Endpoints;

public sealed record KeyRequest(string Key);

public sealed record MatchRequest(string Key, string Provider, string Id);

public sealed record SubtitleRequest(string Key, string? EpisodePath);

public sealed record WatchedRequest(string Key, List<string> Paths, bool Watched);

public sealed record PlayTitleRequest(string Key);

public sealed record SubtitleSearchRequest(string Key, string? EpisodePath, string? Language);

public sealed record SubtitleDownloadRequest(string Key, string? EpisodePath, int FileId, string Language);

public static class LibraryEndpoints
{
    public static void MapLibraryEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/library/{serverId}", (string serverId, LibraryService lib, CancellationToken ct) =>
            lib.GetLibraryAsync(serverId, ct));

        api.MapPost("/library/{serverId}/scan", (string serverId, LibraryService lib, CancellationToken ct) =>
            lib.ScanAsync(serverId, ct));

        api.MapGet("/library/{serverId}/title", (string serverId, string key, LibraryService lib, CancellationToken ct) =>
            lib.GetTitleAsync(serverId, key, ct));

        api.MapGet("/library/{serverId}/artwork", async (string serverId, string key, string? kind, LibraryService lib, HttpContext http, CancellationToken ct) =>
        {
            var stream = await lib.OpenArtworkAsync(serverId, key, kind ?? "poster", ct);
            if (stream == null) return Results.NotFound();
            http.Response.Headers.CacheControl = "private, max-age=300";
            return Results.Stream(stream, "image/jpeg");
        });

        api.MapPost("/library/{serverId}/match", (string serverId, MatchRequest req, LibraryService lib, CancellationToken ct) =>
            lib.ApplyMatchAsync(serverId, req.Key, req.Provider, req.Id, ct));

        api.MapPost("/library/{serverId}/refresh", (string serverId, KeyRequest req, LibraryService lib, CancellationToken ct) =>
            lib.RefreshMetadataAsync(serverId, req.Key, ct));

        // Play a whole title: a movie's file, or a series' next episode. Opens in the default player.
        api.MapPost("/library/{serverId}/play", async (string serverId, PlayTitleRequest req, LibraryService lib, MediaServerRegistry registry, CancellationToken ct) =>
        {
            var path = await lib.PlayTargetAsync(serverId, req.Key, ct) ?? throw new UserFacingException("Nothing to play: no episode of this title is on this media server.");
            await registry.GetNode(serverId).OpenWithDefaultPlayerAsync(path, ct);
            lib.RecordPlayed(serverId, path);
            return new { path };
        });

        api.MapPost("/library/{serverId}/watched", async (string serverId, WatchedRequest req, LibraryService lib, CancellationToken ct) =>
        {
            await lib.SetWatchedAsync(serverId, req.Key, req.Paths ?? new List<string>(), req.Watched, ct);
            return Results.NoContent();
        });

        // Newly released episodes of series you have, on every media server.
        api.MapGet("/news", (LibraryService lib, CancellationToken ct) => lib.GetNewsAsync(ct));

        // Pick a subtitle yourself: search (scored, best first), then download the one you choose.
        api.MapPost("/library/{serverId}/subtitles/search", (string serverId, SubtitleSearchRequest req, LibraryService lib, CancellationToken ct) =>
            lib.SearchSubtitlesAsync(serverId, req.Key, req.EpisodePath, req.Language, ct));

        api.MapPost("/library/{serverId}/subtitles/download", async (string serverId, SubtitleDownloadRequest req, LibraryService lib, CancellationToken ct) =>
            new { path = await lib.DownloadSubtitleAsync(serverId, req.Key, req.EpisodePath, req.FileId, req.Language, ct) });

        api.MapPost("/library/{serverId}/subtitles", (string serverId, SubtitleRequest req, LibraryService lib, CancellationToken ct) =>
            lib.FetchSubtitlesAsync(serverId, req.Key, req.EpisodePath, ct));

        api.MapGet("/metadata/search", async (string provider, string kind, string q, int? year, LibraryService lib, CancellationToken ct) =>
        {
            var k = kind.ToLowerInvariant() switch
            {
                "movie" => MediaKind.Movie,
                "tv" => MediaKind.Tv,
                _ => throw new UserFacingException("kind must be movie or tv."),
            };
            return await lib.SearchAsync(provider, k, q, year, ct);
        });
    }
}
