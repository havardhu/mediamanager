using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Core.Nodes;

/// <summary>A file inside a media server's library root, addressed by its relative path.</summary>
public sealed record NodeFile(string RelativePath, long Size, DateTime ModifiedUtc);

public sealed record NodeStatus(
    bool Online,
    string LibraryRoot,
    long? TotalBytes,
    long? FreeBytes,
    string Version,
    DateTime? LastSeenUtc,
    string? Error);

/// <summary>Instruction for a node to pull one file from the seedbox into its library.</summary>
public sealed record NodeDownloadRequest(
    SeedboxConnection Seedbox,
    string RemotePath,
    string RelativePath,
    long ExpectedSize,
    DateTime? RemoteModifiedUtc);

public sealed record MediaTags(
    string? Title,
    string? Author,
    string? Album,
    int? Year,
    double? DurationSeconds,
    byte[]? Cover,
    string? CoverMimeType);

/// <summary>
/// A media server, seen from the Seedbox Sync service. This is the seam for remote media PCs:
/// <list type="bullet">
/// <item><see cref="LocalMediaNode"/> runs in-process and works on this PC's disk.</item>
/// <item><see cref="RemoteMediaNode"/> calls another PC running Seedbox Sync over its peer API.
/// That PC runs a <see cref="LocalMediaNode"/> for its own disk, so the logic is written once.</item>
/// </list>
/// Everything here is file-level and stateless. Library logic (matching, artwork, subtitles)
/// lives in the service and only uses these primitives, so the peer API stays small.
/// </summary>
public interface IMediaNode
{
    string ServerId { get; }

    Task<NodeStatus> GetStatusAsync(CancellationToken ct);

    /// <summary>Every file under the library root. Partial downloads are excluded.</summary>
    Task<IReadOnlyList<NodeFile>> ScanAsync(CancellationToken ct);

    Task<NodeFile?> GetFileAsync(string relativePath, CancellationToken ct);

    /// <summary>A seekable read stream, used for playback with HTTP range requests.</summary>
    Task<Stream> OpenReadAsync(string relativePath, CancellationToken ct);

    /// <summary>Up to <paramref name="count"/> bytes from <paramref name="offset"/> (for file hashes).</summary>
    Task<byte[]> ReadRangeAsync(string relativePath, long offset, int count, CancellationToken ct);

    /// <summary>Writes a small file (artwork, .nfo, subtitles) atomically.</summary>
    Task WriteFileAsync(string relativePath, Stream content, CancellationToken ct);

    /// <summary>
    /// Pulls a file straight from the seedbox onto this node, resuming a partial download when
    /// possible. <paramref name="onPosition"/> receives the absolute number of bytes on disk.
    /// </summary>
    Task<NodeFile> DownloadFromSeedboxAsync(NodeDownloadRequest request, Action<long> onPosition, CancellationToken ct);

    /// <summary>Removes the partial file left by a cancelled download.</summary>
    Task DiscardPartialAsync(string relativePath, CancellationToken ct);

    Task<MediaTags?> ReadTagsAsync(string relativePath, CancellationToken ct);

    /// <summary>Opens the file with the default application on that PC's desktop.</summary>
    Task OpenWithDefaultPlayerAsync(string relativePath, CancellationToken ct);
}
