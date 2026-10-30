using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedboxSync.Core.Common;

/// <summary>
/// The application has no database. Everything that must survive a restart is a small JSON
/// file in the data directory, written atomically (temp file + replace).
/// </summary>
public static class JsonFileStore
{
    public static readonly JsonSerializerOptions Options = CreateOptions();

    public static JsonSerializerOptions CreateOptions()
    {
        var o = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            WriteIndented = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        o.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return o;
    }

    private static readonly object WriteLock = new();

    public static T? Read<T>(string path) where T : class
    {
        try
        {
            if (!File.Exists(path)) return null;
            using var s = File.OpenRead(path);
            return JsonSerializer.Deserialize<T>(s, Options);
        }
        catch (JsonException)
        {
            // A corrupt file should not stop the service; keep a copy for inspection.
            TryBackupCorrupt(path);
            return null;
        }
    }

    public static void Write<T>(string path, T value)
    {
        lock (WriteLock)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            var tmp = path + ".tmp";
            using (var s = File.Create(tmp))
            {
                JsonSerializer.Serialize(s, value, Options);
            }
            if (File.Exists(path)) File.Replace(tmp, path, null);
            else File.Move(tmp, path);
        }
    }

    private static void TryBackupCorrupt(string path)
    {
        try { File.Copy(path, path + ".corrupt-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss"), true); }
        catch (IOException) { }
    }
}
