namespace SeedboxSync.Core.Common;

/// <summary>Where the service keeps its state. Defaults to %ProgramData%\SeedboxSync.</summary>
public sealed class AppPaths
{
    public AppPaths(string? dataDirectory)
    {
        DataDirectory = string.IsNullOrWhiteSpace(dataDirectory)
            ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "SeedboxSync")
            : Environment.ExpandEnvironmentVariables(dataDirectory);
        Directory.CreateDirectory(DataDirectory);
        Directory.CreateDirectory(LibraryDirectory);
        Directory.CreateDirectory(ArtworkDirectory);
    }

    public string DataDirectory { get; }
    public string SettingsFile => Path.Combine(DataDirectory, "settings.json");
    public string ServersFile => Path.Combine(DataDirectory, "servers.json");
    public string TransfersFile => Path.Combine(DataDirectory, "transfers.json");
    public string SeedboxCacheFile => Path.Combine(DataDirectory, "seedbox-cache.json");
    public string LibraryDirectory => Path.Combine(DataDirectory, "library");
    public string ArtworkDirectory => Path.Combine(DataDirectory, "artwork");

    public string LibraryIndexFile(string serverId) => Path.Combine(LibraryDirectory, Safe(serverId) + ".json");
    public string InventoryCacheFile(string serverId) => Path.Combine(LibraryDirectory, Safe(serverId) + ".inventory.json");

    public static string Safe(string s)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return new string(s.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
    }
}
