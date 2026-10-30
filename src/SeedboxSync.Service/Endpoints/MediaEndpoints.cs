using SeedboxSync.Core.Common;
using SeedboxSync.Core.Library;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Service.Endpoints;

public sealed record OpenRequest(string Path);

/// <summary>
/// Media files for players elsewhere. There is no player in the UI: titles open in the default
/// player on the media server, and <c>/stream</c> serves the file as is with HTTP range support
/// for a network player (VLC, Kodi) or a later TV app.
/// </summary>
public static class MediaEndpoints
{
    public static void MapMediaEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/media/{serverId}/stream", async (string serverId, string path, MediaServerRegistry registry, CancellationToken ct) =>
        {
            var node = registry.GetNode(serverId);
            var rel = RelPath.Normalize(path);
            var info = await node.GetFileAsync(rel, ct) ?? throw new UserFacingException("The file is not on this media server.", 404);
            var stream = await node.OpenReadAsync(rel, ct);
            return Results.File(stream, ContentType(rel), lastModified: info.ModifiedUtc, enableRangeProcessing: true);
        });

        api.MapPost("/media/{serverId}/open", async (string serverId, OpenRequest req, MediaServerRegistry registry, LibraryService library, CancellationToken ct) =>
        {
            await registry.GetNode(serverId).OpenWithDefaultPlayerAsync(req.Path, ct);
            // Remembered for "Up next" and "Continue watching".
            library.RecordPlayed(serverId, req.Path);
            return Results.NoContent();
        });
    }

    private static string ContentType(string path) => Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".mp4" or ".m4v" => "video/mp4",
        ".mkv" => "video/x-matroska",
        ".webm" => "video/webm",
        ".mov" => "video/quicktime",
        ".avi" => "video/x-msvideo",
        ".ts" or ".m2ts" => "video/mp2t",
        ".wmv" => "video/x-ms-wmv",
        ".m4b" or ".m4a" => "audio/mp4",
        ".mp3" => "audio/mpeg",
        ".aac" => "audio/aac",
        ".flac" => "audio/flac",
        ".ogg" or ".opus" => "audio/ogg",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        _ => "application/octet-stream",
    };
}
