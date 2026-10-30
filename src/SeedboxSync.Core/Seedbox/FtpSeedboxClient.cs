using FluentFTP;
using SeedboxSync.Core.Configuration;

namespace SeedboxSync.Core.Seedbox;

/// <summary>FTP and FTPS (explicit on any port except 990, implicit on 990) via FluentFTP.</summary>
public sealed class FtpSeedboxClient : ISeedboxClient
{
    private readonly AsyncFtpClient _client;

    public FtpSeedboxClient(SeedboxConnection c)
    {
        _client = new AsyncFtpClient(c.Host, c.Username, c.Password, c.Port);
        _client.Config.ConnectTimeout = 15000;
        _client.Config.ReadTimeout = 30000;
        _client.Config.DataConnectionConnectTimeout = 15000;
        _client.Config.DataConnectionReadTimeout = 30000;
        if (c.Protocol == SeedboxProtocol.Ftps)
        {
            _client.Config.EncryptionMode = c.Port == 990 ? FtpEncryptionMode.Implicit : FtpEncryptionMode.Explicit;
            _client.Config.ValidateAnyCertificate = c.AcceptAnyCertificate;
        }
        else
        {
            _client.Config.EncryptionMode = FtpEncryptionMode.None;
        }
    }

    public Task ConnectAsync(CancellationToken ct) => _client.Connect(ct);

    public async Task<IReadOnlyList<RemoteEntry>> ListRecursiveAsync(string remoteRoot, CancellationToken ct)
    {
        // Walk folder by folder rather than relying on server-side recursive LIST, which many servers lack.
        var result = new List<RemoteEntry>();
        var pending = new Stack<string>();
        pending.Push(remoteRoot);
        while (pending.Count > 0)
        {
            ct.ThrowIfCancellationRequested();
            var dir = pending.Pop();
            foreach (var e in await ListAsync(dir, ct))
            {
                result.Add(e);
                if (e.IsDirectory) pending.Push(e.FullPath);
            }
        }
        return result;
    }

    public Task<bool> DirectoryExistsAsync(string remotePath, CancellationToken ct) => _client.DirectoryExists(remotePath, ct);

    public async Task<IReadOnlyList<RemoteEntry>> ListAsync(string remotePath, CancellationToken ct)
    {
        var items = await _client.GetListing(remotePath, ct);
        var list = new List<RemoteEntry>(items.Length);
        foreach (var i in items)
        {
            if (i.Name is "." or "..") continue;
            if (i.Type == FtpObjectType.Directory)
                list.Add(new RemoteEntry(Combine(remotePath, i.Name), i.Name, true, 0, ToUtc(i.Modified)));
            else if (i.Type == FtpObjectType.File)
                list.Add(new RemoteEntry(Combine(remotePath, i.Name), i.Name, false, i.Size, ToUtc(i.Modified)));
        }
        return list;
    }

    public Task<RemoteStorage?> GetStorageAsync(string remotePath, CancellationToken ct) =>
        Task.FromResult<RemoteStorage?>(null);

    public bool SupportsResume => true;

    public async Task DownloadAsync(string remotePath, Stream destination, long offset, Action<long> onBytes, CancellationToken ct)
    {
        // Count bytes as they are written rather than trusting the library's progress semantics.
        using var counting = new CountingWriteStream(destination, onBytes);
        var ok = await _client.DownloadStream(counting, remotePath, offset, null, ct);
        if (!ok) throw new IOException($"The seedbox refused to send {remotePath}.");
    }

    public Task DeleteFileAsync(string remotePath, CancellationToken ct) => _client.DeleteFile(remotePath, ct);

    public Task DeleteDirectoryAsync(string remotePath, CancellationToken ct) => _client.DeleteDirectory(remotePath, ct);

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_client.IsConnected) await _client.Disconnect();
        }
        catch (Exception)
        {
            // The connection may already be gone.
        }
        _client.Dispose();
    }

    private static string Combine(string dir, string name) => dir.EndsWith('/') ? dir + name : dir + "/" + name;

    private static DateTime? ToUtc(DateTime d) =>
        d == DateTime.MinValue ? null : (d.Kind == DateTimeKind.Utc ? d : d.ToUniversalTime());
}
