using Renci.SshNet;

namespace SeedboxSync.Core.Seedbox;

/// <summary>SFTP via SSH.NET. SSH.NET is synchronous, so calls run on the thread pool.</summary>
public sealed class SftpSeedboxClient : ISeedboxClient
{
    private readonly SftpClient _client;

    public SftpSeedboxClient(SeedboxConnection c)
    {
        _client = new SftpClient(c.Host, c.Port, c.Username, c.Password);
        _client.ConnectionInfo.Timeout = TimeSpan.FromSeconds(15);
        _client.OperationTimeout = TimeSpan.FromMinutes(2);
        _client.KeepAliveInterval = TimeSpan.FromSeconds(30);
        // Larger read requests where the server allows them (OpenSSH accepts up to ~256 KB).
        _client.BufferSize = 256 * 1024;
    }

    public Task ConnectAsync(CancellationToken ct) => Task.Run(() => _client.Connect(), ct);

    public Task<IReadOnlyList<RemoteEntry>> ListRecursiveAsync(string remoteRoot, CancellationToken ct) => Task.Run(() =>
    {
        var result = new List<RemoteEntry>();
        var pending = new Stack<string>();
        pending.Push(remoteRoot);
        while (pending.Count > 0)
        {
            ct.ThrowIfCancellationRequested();
            var dir = pending.Pop();
            foreach (var e in ListSync(dir))
            {
                result.Add(e);
                if (e.IsDirectory) pending.Push(e.FullPath);
            }
        }
        return (IReadOnlyList<RemoteEntry>)result;
    }, ct);

    public Task<bool> DirectoryExistsAsync(string remotePath, CancellationToken ct) => Task.Run(() =>
    {
        if (!_client.Exists(remotePath)) return false;
        return _client.GetAttributes(remotePath).IsDirectory;
    }, ct);

    public Task<IReadOnlyList<RemoteEntry>> ListAsync(string remotePath, CancellationToken ct) =>
        Task.Run(() => (IReadOnlyList<RemoteEntry>)ListSync(remotePath), ct);

    private List<RemoteEntry> ListSync(string dir)
    {
        var list = new List<RemoteEntry>();
        foreach (var f in _client.ListDirectory(dir))
        {
            if (f.Name is "." or "..") continue;
            if (f.IsDirectory)
                list.Add(new RemoteEntry(f.FullName, f.Name, true, 0, f.LastWriteTimeUtc));
            else if (f.IsRegularFile)
                list.Add(new RemoteEntry(f.FullName, f.Name, false, f.Length, f.LastWriteTimeUtc));
            // Symlinks, sockets and devices are skipped.
        }
        return list;
    }

    public Task<RemoteStorage?> GetStorageAsync(string remotePath, CancellationToken ct) => Task.Run(() =>
    {
        try
        {
            // statvfs@openssh.com; most seedboxes support it.
            var st = _client.GetStatus(remotePath);
            var block = (long)st.BlockSize;
            return (RemoteStorage?)new RemoteStorage((long)st.TotalBlocks * block, (long)st.AvailableBlocks * block);
        }
        catch (Exception)
        {
            return null;
        }
    }, ct);

    /// <summary>
    /// SftpClient.DownloadFile keeps many read requests in flight, so throughput is limited by
    /// bandwidth, not round-trip time. It cannot start at an offset, so partial files restart.
    /// (Reading through SftpFileStream instead waits one round trip per 32 KB chunk, which caps
    /// a transfer at roughly 1 MB/s to a seedbox in another country.)
    /// </summary>
    public bool SupportsResume => false;

    public Task DownloadAsync(string remotePath, Stream destination, long offset, Action<long> onBytes, CancellationToken ct) => Task.Run(() =>
    {
        if (offset != 0) throw new NotSupportedException("SFTP downloads restart from the beginning.");
        // The wrapper counts bytes and aborts the (otherwise uncancellable) download on cancel.
        using var counting = new CountingWriteStream(destination, onBytes, ct);
        _client.DownloadFile(remotePath, counting);
    }, ct);

    public Task DeleteFileAsync(string remotePath, CancellationToken ct) => Task.Run(() => _client.DeleteFile(remotePath), ct);

    public Task DeleteDirectoryAsync(string remotePath, CancellationToken ct) => Task.Run(() => DeleteTree(remotePath, ct), ct);

    private void DeleteTree(string dir, CancellationToken ct)
    {
        foreach (var f in _client.ListDirectory(dir))
        {
            ct.ThrowIfCancellationRequested();
            if (f.Name is "." or "..") continue;
            if (f.IsDirectory && !f.IsSymbolicLink) DeleteTree(f.FullName, ct);
            else _client.DeleteFile(f.FullName);
        }
        _client.DeleteDirectory(dir);
    }

    public ValueTask DisposeAsync()
    {
        try
        {
            if (_client.IsConnected) _client.Disconnect();
        }
        catch (Exception)
        {
            // Already closed.
        }
        _client.Dispose();
        return ValueTask.CompletedTask;
    }
}
