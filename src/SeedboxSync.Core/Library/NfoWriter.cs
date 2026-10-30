using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace SeedboxSync.Core.Library;

/// <summary>Kodi/Jellyfin/Plex-compatible .nfo sidecars.</summary>
public static class NfoWriter
{
    public static byte[] Movie(TitleMeta m) => Write(new XElement("movie",
        Common(m),
        m.Credit == null ? null : m.Credit.Split(", ").Select(d => new XElement("director", d))));

    public static byte[] TvShow(TitleMeta m) => Write(new XElement("tvshow",
        Common(m),
        m.Credit == null ? null : new XElement("studio", m.Credit)));

    private static IEnumerable<XElement?> Common(TitleMeta m)
    {
        yield return new XElement("title", m.Title);
        if (m.Year != null) yield return new XElement("year", m.Year);
        if (!string.IsNullOrWhiteSpace(m.Overview)) yield return new XElement("plot", m.Overview);
        if (m.RuntimeMinutes != null) yield return new XElement("runtime", m.RuntimeMinutes);
        if (!string.IsNullOrEmpty(m.ProviderId))
            yield return new XElement("uniqueid", new XAttribute("type", m.Provider.ToLowerInvariant()), new XAttribute("default", "true"), m.ProviderId);
        if (!string.IsNullOrEmpty(m.TmdbId) && !m.Provider.Equals("TMDB", StringComparison.OrdinalIgnoreCase))
            yield return new XElement("uniqueid", new XAttribute("type", "tmdb"), m.TmdbId);
        if (!string.IsNullOrEmpty(m.ImdbId)) yield return new XElement("uniqueid", new XAttribute("type", "imdb"), m.ImdbId);
        foreach (var g in m.Genres) yield return new XElement("genre", g);
        yield return new XElement("thumb", new XAttribute("aspect", "poster"), "poster.jpg");
    }

    private static byte[] Write(XElement root)
    {
        var doc = new XDocument(new XDeclaration("1.0", "utf-8", "yes"), root);
        var settings = new XmlWriterSettings { Encoding = new UTF8Encoding(false), Indent = true };
        using var ms = new MemoryStream();
        using (var w = XmlWriter.Create(ms, settings)) doc.Save(w);
        return ms.ToArray();
    }
}

/// <summary>Orders "Part 2" before "Part 10".</summary>
public sealed class NaturalComparer : IComparer<string>
{
    public static readonly NaturalComparer Instance = new();

    public int Compare(string? x, string? y)
    {
        if (ReferenceEquals(x, y)) return 0;
        if (x == null) return -1;
        if (y == null) return 1;
        int i = 0, j = 0;
        while (i < x.Length && j < y.Length)
        {
            if (char.IsDigit(x[i]) && char.IsDigit(y[j]))
            {
                var si = i;
                var sj = j;
                while (i < x.Length && char.IsDigit(x[i])) i++;
                while (j < y.Length && char.IsDigit(y[j])) j++;
                var a = x[si..i].TrimStart('0');
                var b = y[sj..j].TrimStart('0');
                if (a.Length != b.Length) return a.Length.CompareTo(b.Length);
                var c = string.CompareOrdinal(a, b);
                if (c != 0) return c;
            }
            else
            {
                var c = char.ToLowerInvariant(x[i]).CompareTo(char.ToLowerInvariant(y[j]));
                if (c != 0) return c;
                i++;
                j++;
            }
        }
        return (x.Length - i).CompareTo(y.Length - j);
    }
}
