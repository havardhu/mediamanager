namespace SeedboxSync.Core.Common;

/// <summary>
/// Relative paths are the shared language between the seedbox and every media server.
/// They always use forward slashes, never start or end with a slash, and never contain
/// "." or ".." segments. "Movies/Dune Part Two (2024)/Dune.mkv" means the same file
/// under the seedbox media root and under each media server's library root.
/// </summary>
public static class RelPath
{
    public static readonly StringComparer Comparer = StringComparer.OrdinalIgnoreCase;

    /// <summary>Normalises a relative path and rejects anything that could escape the root.</summary>
    public static string Normalize(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return string.Empty;
        var parts = path.Replace('\\', '/')
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .ToList();
        foreach (var p in parts)
        {
            if (p == "." || p == "..")
                throw new ArgumentException($"Path segment '{p}' is not allowed.", nameof(path));
        }
        return string.Join('/', parts);
    }

    public static string Combine(string a, string b)
    {
        a = a.Trim('/');
        b = b.Trim('/');
        if (a.Length == 0) return b;
        if (b.Length == 0) return a;
        return a + "/" + b;
    }

    public static string Parent(string rel)
    {
        var i = rel.LastIndexOf('/');
        return i < 0 ? string.Empty : rel[..i];
    }

    public static string Name(string rel)
    {
        var i = rel.LastIndexOf('/');
        return i < 0 ? rel : rel[(i + 1)..];
    }

    public static int Depth(string rel) => rel.Length == 0 ? 0 : rel.Count(c => c == '/') + 1;

    public static string[] Segments(string rel) => rel.Length == 0 ? Array.Empty<string>() : rel.Split('/');

    public static bool IsSameOrUnder(string rel, string ancestor)
    {
        if (ancestor.Length == 0) return true;
        return rel.Equals(ancestor, StringComparison.OrdinalIgnoreCase)
            || rel.StartsWith(ancestor + "/", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>Maps a relative path onto a remote POSIX root such as /home/rob/media.</summary>
    public static string ToRemote(string remoteRoot, string rel)
    {
        var root = string.IsNullOrEmpty(remoteRoot) ? "/" : remoteRoot.Replace('\\', '/');
        if (root.Length > 1) root = root.TrimEnd('/');
        if (rel.Length == 0) return root;
        return root == "/" ? "/" + rel : root + "/" + rel;
    }

    /// <summary>Turns a remote absolute path back into a path relative to the remote root, or null if outside it.</summary>
    public static string? FromRemote(string remoteRoot, string remotePath)
    {
        var root = remoteRoot.Replace('\\', '/').TrimEnd('/');
        var path = remotePath.Replace('\\', '/');
        if (root.Length == 0) return Normalize(path);
        if (path.Equals(root, StringComparison.Ordinal)) return string.Empty;
        if (!path.StartsWith(root + "/", StringComparison.Ordinal)) return null;
        return Normalize(path[(root.Length + 1)..]);
    }

    private static readonly char[] WindowsInvalid = { ':', '*', '?', '"', '<', '>', '|' };

    /// <summary>
    /// Seedboxes run Linux, where "Dune: Part Two" is a valid folder name. Windows rejects some
    /// of those characters, so each segment is made safe the same way on every media server.
    /// Inventory lookups use this form, so a renamed segment still counts as synced.
    /// </summary>
    public static string LocalSafe(string rel)
    {
        if (rel.Length == 0) return rel;
        return string.Join('/', Segments(rel).Select(seg =>
        {
            var chars = seg.Select(c => c < 32 || Array.IndexOf(WindowsInvalid, c) >= 0 ? '_' : c).ToArray();
            var s = new string(chars).TrimEnd('.', ' ');
            return s.Length == 0 ? "_" : s;
        }));
    }

    /// <summary>Maps a relative path onto a local Windows (or other OS) root folder.</summary>
    public static string ToLocal(string localRoot, string rel)
    {
        if (rel.Length == 0) return localRoot;
        rel = LocalSafe(rel);
        var full = Path.GetFullPath(Path.Combine(localRoot, rel.Replace('/', Path.DirectorySeparatorChar)));
        var rootFull = Path.GetFullPath(localRoot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        if (!full.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Path resolves outside the library root.", nameof(rel));
        return full;
    }
}
