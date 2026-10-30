using System.Diagnostics;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Seedbox;

namespace SeedboxSync.Core.Nodes;

/// <summary>The media library on this PC. Also the core of the future remote agent.</summary>
public sealed class LocalMediaNode : IMediaNode
{
    public const string PartialSuffix = ".part";
    private readonly Func<string> _root;
    private readonly ISeedboxClientFactory _clients;

    public LocalMediaNode(string serverId, Func<string> libraryRoot, ISeedboxClientFactory clients)
    {
        ServerId = serverId;
        _root = libraryRoot;
        _clients = clients;
    }

    public string ServerId { get; }

    private string Root
    {
        get
        {
            var r = _root();
            if (string.IsNullOrWhiteSpace(r))
                throw new UserFacingException("No library folder is set for this server. Set it on the Servers tab.");
            return r;
        }
    }

    public Task<NodeStatus> GetStatusAsync(CancellationToken ct)
    {
        var root = _root();
        long? total = null, free = null;
        string? error = null;
        try
        {
            if (!string.IsNullOrWhiteSpace(root))
            {
                var drive = new DriveInfo(Path.GetPathRoot(Path.GetFullPath(root))!);
                if (drive.IsReady)
                {
                    total = drive.TotalSize;
                    free = drive.AvailableFreeSpace;
                }
                if (!Directory.Exists(root)) error = "The library folder does not exist yet. It is created with the first download.";
            }
            else
            {
                error = "No library folder is set.";
            }
        }
        catch (Exception ex) when (ex is IOException or ArgumentException or UnauthorizedAccessException)
        {
            error = ex.Message;
        }
        var version = typeof(LocalMediaNode).Assembly.GetName().Version?.ToString(3) ?? "1.0.0";
        return Task.FromResult(new NodeStatus(true, root, total, free, "Service " + version, DateTime.UtcNow, error));
    }

    public Task<IReadOnlyList<NodeFile>> ScanAsync(CancellationToken ct) => Task.Run(() =>
    {
        var root = _root();
        var list = new List<NodeFile>();
        if (string.IsNullOrWhiteSpace(root) || !Directory.Exists(root)) return (IReadOnlyList<NodeFile>)list;
        var rootFull = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar);
        var options = new EnumerationOptions
        {
            RecurseSubdirectories = true,
            IgnoreInaccessible = true,
            AttributesToSkip = FileAttributes.Hidden | FileAttributes.System,
            ReturnSpecialDirectories = false,
        };
        foreach (var path in Directory.EnumerateFiles(rootFull, "*", options))
        {
            ct.ThrowIfCancellationRequested();
            if (path.EndsWith(PartialSuffix, StringComparison.OrdinalIgnoreCase)) continue;
            var fi = new FileInfo(path);
            var rel = path[(rootFull.Length + 1)..].Replace(Path.DirectorySeparatorChar, '/');
            list.Add(new NodeFile(rel, fi.Length, fi.LastWriteTimeUtc));
        }
        return (IReadOnlyList<NodeFile>)list;
    }, ct);

    public Task<NodeFile?> GetFileAsync(string relativePath, CancellationToken ct)
    {
        var rel = RelPath.LocalSafe(RelPath.Normalize(relativePath));
        var fi = new FileInfo(RelPath.ToLocal(Root, rel));
        return Task.FromResult(fi.Exists ? new NodeFile(rel, fi.Length, fi.LastWriteTimeUtc) : null);
    }

    public Task<Stream> OpenReadAsync(string relativePath, CancellationToken ct)
    {
        var full = RelPath.ToLocal(Root, RelPath.Normalize(relativePath));
        if (!File.Exists(full)) throw new UserFacingException("The file is not on this media server.", 404);
        Stream s = new FileStream(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete,
            64 * 1024, FileOptions.Asynchronous);
        return Task.FromResult(s);
    }

    public async Task<byte[]> ReadRangeAsync(string relativePath, long offset, int count, CancellationToken ct)
    {
        var full = RelPath.ToLocal(Root, RelPath.Normalize(relativePath));
        if (!File.Exists(full)) throw new UserFacingException("The file is not on this media server.", 404);
        await using var fs = new FileStream(full, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete, 4096, FileOptions.Asynchronous);
        fs.Seek(offset, SeekOrigin.Begin);
        var buffer = new byte[count];
        var read = await fs.ReadAtLeastAsync(buffer, count, throwOnEndOfStream: false, ct);
        return read == count ? buffer : buffer[..read];
    }

    public async Task WriteFileAsync(string relativePath, Stream content, CancellationToken ct)
    {
        var full = RelPath.ToLocal(Root, RelPath.Normalize(relativePath));
        Directory.CreateDirectory(Path.GetDirectoryName(full)!);
        var tmp = full + ".tmp";
        await using (var fs = new FileStream(tmp, FileMode.Create, FileAccess.Write, FileShare.None, 64 * 1024, true))
        {
            await content.CopyToAsync(fs, ct);
        }
        File.Move(tmp, full, true);
    }

    public async Task<NodeFile> DownloadFromSeedboxAsync(NodeDownloadRequest request, Action<long> onPosition, CancellationToken ct)
    {
        var rel = RelPath.LocalSafe(RelPath.Normalize(request.RelativePath));
        var final = RelPath.ToLocal(Root, rel);
        var part = final + PartialSuffix;
        Directory.CreateDirectory(Path.GetDirectoryName(final)!);

        var existing = new FileInfo(final);
        if (existing.Exists && existing.Length == request.ExpectedSize)
        {
            onPosition(existing.Length);
            return new NodeFile(rel, existing.Length, existing.LastWriteTimeUtc);
        }

        long offset = File.Exists(part) ? new FileInfo(part).Length : 0;
        if (offset > request.ExpectedSize)
        {
            File.Delete(part);
            offset = 0;
        }
        onPosition(offset);

        if (offset < request.ExpectedSize || request.ExpectedSize == 0)
        {
            await using var client = _clients.Create(request.Seedbox);
            await client.ConnectAsync(ct);
            if (offset > 0 && !client.SupportsResume)
            {
                File.Delete(part);
                offset = 0;
                onPosition(0);
            }
            await using var fs = new FileStream(part, FileMode.Append, FileAccess.Write, FileShare.Read, 1024 * 1024, true);
            long position = offset;
            await client.DownloadAsync(request.RemotePath, fs, offset, n =>
            {
                position += n;
                onPosition(position);
            }, ct);
            await fs.FlushAsync(ct);
        }

        var got = new FileInfo(part).Length;
        if (request.ExpectedSize > 0 && got != request.ExpectedSize)
            throw new IOException($"Download incomplete: {got:N0} of {request.ExpectedSize:N0} bytes. It resumes on the next attempt.");

        File.Move(part, final, true);
        if (request.RemoteModifiedUtc is { } mod)
        {
            try { File.SetLastWriteTimeUtc(final, mod); }
            catch (IOException) { }
        }
        var fi = new FileInfo(final);
        return new NodeFile(rel, fi.Length, fi.LastWriteTimeUtc);
    }

    public Task DiscardPartialAsync(string relativePath, CancellationToken ct)
    {
        try
        {
            var part = RelPath.ToLocal(Root, RelPath.Normalize(relativePath)) + PartialSuffix;
            if (File.Exists(part)) File.Delete(part);
        }
        catch (IOException)
        {
            // Still open by a finishing transfer; it is cleaned up on the next attempt.
        }
        return Task.CompletedTask;
    }

    public Task<MediaTags?> ReadTagsAsync(string relativePath, CancellationToken ct) => Task.Run(() =>
    {
        var full = RelPath.ToLocal(Root, RelPath.Normalize(relativePath));
        if (!File.Exists(full)) return null;
        try
        {
            using var f = TagLib.File.Create(full);
            var t = f.Tag;
            byte[]? cover = null;
            string? mime = null;
            if (t.Pictures is { Length: > 0 })
            {
                cover = t.Pictures[0].Data.Data;
                mime = t.Pictures[0].MimeType;
            }
            var author = t.FirstAlbumArtist ?? t.FirstPerformer ?? t.FirstComposer;
            return (MediaTags?)new MediaTags(
                string.IsNullOrWhiteSpace(t.Album) ? t.Title : t.Album,
                author,
                t.Album,
                t.Year > 0 ? (int)t.Year : null,
                f.Properties?.Duration.TotalSeconds,
                cover,
                mime);
        }
        catch (Exception ex) when (ex is TagLib.UnsupportedFormatException or TagLib.CorruptFileException or IOException)
        {
            return null;
        }
    }, ct);

    public Task OpenWithDefaultPlayerAsync(string relativePath, CancellationToken ct)
    {
        var full = RelPath.ToLocal(Root, RelPath.Normalize(relativePath));
        if (!File.Exists(full)) throw new UserFacingException("The file is not on this media server.", 404);
        if (!Environment.UserInteractive)
            throw new UserFacingException(
                "The Windows service has no desktop to open a player on. Run SeedboxSync.exe from a console, or use Copy path and open the file in your player.");
        Process.Start(new ProcessStartInfo(full) { UseShellExecute = true });
        return Task.CompletedTask;
    }
}
