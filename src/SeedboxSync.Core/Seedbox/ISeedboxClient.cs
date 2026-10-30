using SeedboxSync.Core.Configuration;

namespace SeedboxSync.Core.Seedbox;

/// <summary>Everything a node needs to reach the seedbox. Sent to remote agents so they can download directly.</summary>
public sealed record SeedboxConnection(
    SeedboxProtocol Protocol,
    string Host,
    int Port,
    string Username,
    string Password,
    bool AcceptAnyCertificate)
{
    public static SeedboxConnection From(SeedboxSettings s) =>
        new(s.Protocol, s.Host, s.Port, s.Username, s.Password, s.AcceptAnyCertificate);
}

/// <summary>A file or folder on the seedbox, as an absolute remote path.</summary>
public sealed record RemoteEntry(string FullPath, string Name, bool IsDirectory, long Size, DateTime? ModifiedUtc);

public sealed record RemoteStorage(long TotalBytes, long FreeBytes);

/// <summary>Protocol-neutral access to the seedbox (FTP, FTPS or SFTP).</summary>
public interface ISeedboxClient : IAsyncDisposable
{
    Task ConnectAsync(CancellationToken ct);

    /// <summary>Lists every file and folder below <paramref name="remoteRoot"/>.</summary>
    Task<IReadOnlyList<RemoteEntry>> ListRecursiveAsync(string remoteRoot, CancellationToken ct);

    Task<bool> DirectoryExistsAsync(string remotePath, CancellationToken ct);

    /// <summary>Lists the direct children of a folder.</summary>
    Task<IReadOnlyList<RemoteEntry>> ListAsync(string remotePath, CancellationToken ct);

    /// <summary>Disk usage for the filesystem holding <paramref name="remotePath"/>, or null when the protocol cannot tell.</summary>
    Task<RemoteStorage?> GetStorageAsync(string remotePath, CancellationToken ct);

    /// <summary>False when <see cref="DownloadAsync"/> cannot start at an offset; partial files are then restarted.</summary>
    bool SupportsResume { get; }

    /// <summary>Copies the remote file into <paramref name="destination"/>, starting at <paramref name="offset"/>.</summary>
    Task DownloadAsync(string remotePath, Stream destination, long offset, Action<long> onBytes, CancellationToken ct);

    Task DeleteFileAsync(string remotePath, CancellationToken ct);

    /// <summary>Deletes a folder and everything in it.</summary>
    Task DeleteDirectoryAsync(string remotePath, CancellationToken ct);
}

public interface ISeedboxClientFactory
{
    ISeedboxClient Create(SeedboxConnection connection);
}

public sealed class SeedboxClientFactory : ISeedboxClientFactory
{
    public ISeedboxClient Create(SeedboxConnection connection) => connection.Protocol switch
    {
        SeedboxProtocol.Sftp => new SftpSeedboxClient(connection),
        _ => new FtpSeedboxClient(connection),
    };
}
