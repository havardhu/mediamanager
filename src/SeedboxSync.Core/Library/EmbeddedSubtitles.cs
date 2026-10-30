using System.Buffers.Binary;
using System.Text;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Core.Library;

/// <summary>A subtitle track inside a video file.</summary>
public sealed record EmbeddedSubtitle(string Language, string? Name, string Codec, bool Forced, bool Default);

/// <summary>
/// Lists the subtitle tracks inside MKV and MP4 files by reading only the file's header: the
/// Matroska "Tracks" element, or the MP4 "moov" box. A few small reads, so it also works for
/// files on another PC. Other formats report none.
/// </summary>
public static class EmbeddedSubtitles
{
    private const int MaxTracksBytes = 4 * 1024 * 1024;
    private const int MaxMoovBytes = 32 * 1024 * 1024;

    public static async Task<IReadOnlyList<EmbeddedSubtitle>> ReadAsync(IMediaNode node, string path, long size, CancellationToken ct)
    {
        if (size <= 0) return Array.Empty<EmbeddedSubtitle>();
        return Path.GetExtension(path).ToLowerInvariant() switch
        {
            ".mkv" or ".webm" or ".mk3d" => await ReadMatroskaAsync(node, path, size, ct),
            ".mp4" or ".m4v" or ".mov" => await ReadMp4Async(node, path, size, ct),
            _ => Array.Empty<EmbeddedSubtitle>(),
        };
    }

    // ---- Matroska ---------------------------------------------------------------------------

    private const uint EbmlHeaderId = 0x1A45DFA3, SegmentId = 0x18538067, SeekHeadId = 0x114D9B74, SeekId = 0x4DBB,
        SeekIdId = 0x53AB, SeekPositionId = 0x53AC, TracksId = 0x1654AE6B, TrackEntryId = 0xAE, TrackTypeId = 0x83,
        CodecIdId = 0x86, LanguageId = 0x22B59C, LanguageBcp47Id = 0x22B59D, NameId = 0x536E, FlagDefaultId = 0x88,
        FlagForcedId = 0x55AA, ClusterId = 0x1F43B675;

    private static async Task<IReadOnlyList<EmbeddedSubtitle>> ReadMatroskaAsync(IMediaNode node, string path, long size, CancellationToken ct)
    {
        var buf = await node.ReadRangeAsync(path, 0, (int)Math.Min(size, 512 * 1024), ct);
        long pos = 0;
        if (!TryElement(buf, ref pos, out var id, out var len) || id != EbmlHeaderId || len < 0) return Array.Empty<EmbeddedSubtitle>();
        pos += len;
        if (!TryElement(buf, ref pos, out id, out _) || id != SegmentId) return Array.Empty<EmbeddedSubtitle>();
        var segmentData = pos;

        long tracksAt = -1, tracksLen = -1, seekTracks = -1;
        while (pos < buf.Length)
        {
            if (!TryElement(buf, ref pos, out id, out len)) break;
            if (id == TracksId) { tracksAt = pos; tracksLen = len; break; }
            if (id == ClusterId || len < 0) break;
            if (id == SeekHeadId && pos + len <= buf.Length) seekTracks = FindSeek(buf, pos, pos + len, TracksId);
            pos += len;
        }

        byte[] body;
        if (tracksAt >= 0 && tracksLen >= 0)
        {
            if (tracksAt + tracksLen <= buf.Length) return ParseTracks(buf, tracksAt, tracksAt + tracksLen);
            body = await node.ReadRangeAsync(path, tracksAt, (int)Math.Min(tracksLen, MaxTracksBytes), ct);
        }
        else if (seekTracks >= 0)
        {
            // Tracks after the first clusters (rare): jump there using the seek index.
            var at = segmentData + seekTracks;
            var head = await node.ReadRangeAsync(path, at, 16, ct);
            long p = 0;
            if (!TryElement(head, ref p, out id, out len) || id != TracksId || len < 0) return Array.Empty<EmbeddedSubtitle>();
            body = await node.ReadRangeAsync(path, at + p, (int)Math.Min(len, MaxTracksBytes), ct);
        }
        else
        {
            return Array.Empty<EmbeddedSubtitle>();
        }
        return ParseTracks(body, 0, body.Length);
    }

    private static IReadOnlyList<EmbeddedSubtitle> ParseTracks(byte[] b, long start, long end)
    {
        var list = new List<EmbeddedSubtitle>();
        var pos = start;
        while (pos < end)
        {
            if (!TryElement(b, ref pos, out var id, out var len) || len < 0) break;
            var stop = Math.Min(end, pos + len);
            if (id == TrackEntryId)
            {
                ulong type = 0;
                bool isDefault = true, forced = false;
                string codec = string.Empty, language = "eng", bcp47 = string.Empty;
                string? name = null;
                var p = pos;
                while (p < stop)
                {
                    if (!TryElement(b, ref p, out var cid, out var clen) || clen < 0 || p + clen > stop) break;
                    switch (cid)
                    {
                        case TrackTypeId: type = UInt(b, p, clen); break;
                        case CodecIdId: codec = Str(b, p, clen); break;
                        case LanguageId: language = Str(b, p, clen); break;
                        case LanguageBcp47Id: bcp47 = Str(b, p, clen); break;
                        case NameId: name = Str(b, p, clen); break;
                        case FlagDefaultId: isDefault = UInt(b, p, clen) != 0; break;
                        case FlagForcedId: forced = UInt(b, p, clen) != 0; break;
                    }
                    p += clen;
                }
                if (type == 17)
                    list.Add(new EmbeddedSubtitle(Lang(bcp47.Length > 0 ? bcp47 : language), string.IsNullOrWhiteSpace(name) ? null : name, CodecName(codec), forced, isDefault));
            }
            pos = stop;
        }
        return list;
    }

    private static long FindSeek(byte[] b, long start, long end, uint target)
    {
        var pos = start;
        while (pos < end)
        {
            if (!TryElement(b, ref pos, out var id, out var len) || len < 0) break;
            var stop = Math.Min(end, pos + len);
            if (id == SeekId)
            {
                uint seekId = 0;
                long position = -1;
                var p = pos;
                while (p < stop)
                {
                    if (!TryElement(b, ref p, out var cid, out var clen) || clen < 0 || p + clen > stop) break;
                    if (cid == SeekIdId) seekId = (uint)UInt(b, p, clen);
                    else if (cid == SeekPositionId) position = (long)UInt(b, p, clen);
                    p += clen;
                }
                if (seekId == target && position >= 0) return position;
            }
            pos = stop;
        }
        return -1;
    }

    /// <summary>Reads an EBML element header. Length -1 means "unknown size".</summary>
    private static bool TryElement(byte[] b, ref long pos, out uint id, out long length)
    {
        id = 0;
        length = 0;
        if (pos >= b.Length) return false;
        var first = b[pos];
        var idLen = first >= 0x80 ? 1 : first >= 0x40 ? 2 : first >= 0x20 ? 3 : first >= 0x10 ? 4 : 0;
        if (idLen == 0 || pos + idLen > b.Length) return false;
        for (var i = 0; i < idLen; i++) id = (id << 8) | b[pos + i];
        var p = pos + idLen;
        if (p >= b.Length) return false;
        var s = b[p];
        var sizeLen = 1;
        while (sizeLen <= 8 && (s & (0x80 >> (sizeLen - 1))) == 0) sizeLen++;
        if (sizeLen > 8 || p + sizeLen > b.Length) return false;
        long value = s & (0xFF >> sizeLen);
        var allOnes = value == (0xFF >> sizeLen);
        for (var i = 1; i < sizeLen; i++)
        {
            value = (value << 8) | b[p + i];
            allOnes &= b[p + i] == 0xFF;
        }
        length = allOnes ? -1 : value;
        pos = p + sizeLen;
        return true;
    }

    private static ulong UInt(byte[] b, long pos, long len)
    {
        ulong v = 0;
        for (long i = 0; i < len && i < 8; i++) v = (v << 8) | b[pos + i];
        return v;
    }

    private static string Str(byte[] b, long pos, long len) =>
        Encoding.UTF8.GetString(b, (int)pos, (int)len).TrimEnd('\0').Trim();

    private static string CodecName(string codec) => codec switch
    {
        "S_TEXT/UTF8" => "SRT",
        "S_TEXT/ASS" or "S_ASS" => "ASS",
        "S_TEXT/SSA" or "S_SSA" => "SSA",
        "S_TEXT/WEBVTT" => "WebVTT",
        "S_HDMV/PGS" => "PGS",
        "S_VOBSUB" => "VobSub",
        "S_DVBSUB" => "DVB",
        _ => codec.StartsWith("S_", StringComparison.Ordinal) ? codec[2..] : codec,
    };

    // ---- MP4 --------------------------------------------------------------------------------

    private static async Task<IReadOnlyList<EmbeddedSubtitle>> ReadMp4Async(IMediaNode node, string path, long size, CancellationToken ct)
    {
        // Walk the top-level boxes (ftyp, moov, mdat, ...) until moov, which may come after mdat.
        long offset = 0;
        for (var i = 0; i < 64 && offset + 8 <= size; i++)
        {
            var h = await node.ReadRangeAsync(path, offset, 16, ct);
            if (h.Length < 8) break;
            long boxSize = BinaryPrimitives.ReadUInt32BigEndian(h);
            var type = Encoding.ASCII.GetString(h, 4, 4);
            var header = 8;
            if (boxSize == 1)
            {
                if (h.Length < 16) break;
                boxSize = (long)BinaryPrimitives.ReadUInt64BigEndian(h.AsSpan(8));
                header = 16;
            }
            else if (boxSize == 0)
            {
                boxSize = size - offset;
            }
            if (boxSize < header) break;
            if (type == "moov")
            {
                if (boxSize - header > MaxMoovBytes) break;
                var moov = await node.ReadRangeAsync(path, offset + header, (int)(boxSize - header), ct);
                return ParseMoov(moov);
            }
            offset += boxSize;
        }
        return Array.Empty<EmbeddedSubtitle>();
    }

    private static IReadOnlyList<EmbeddedSubtitle> ParseMoov(byte[] b)
    {
        var list = new List<EmbeddedSubtitle>();
        foreach (var trak in Boxes(b, 0, b.Length).Where(x => x.Type == "trak"))
        {
            var mdia = Boxes(b, trak.Start, trak.End).FirstOrDefault(x => x.Type == "mdia");
            if (mdia.Type == null) continue;
            string? handler = null, entry = null, lang = null;
            foreach (var box in Boxes(b, mdia.Start, mdia.End))
            {
                if (box.Type == "hdlr" && box.End - box.Start >= 12)
                    handler = Encoding.ASCII.GetString(b, box.Start + 8, 4);
                else if (box.Type == "mdhd" && box.End - box.Start >= 24)
                {
                    var at = box.Start + (b[box.Start] == 1 ? 32 : 20);
                    if (at + 2 <= box.End)
                    {
                        var packed = BinaryPrimitives.ReadUInt16BigEndian(b.AsSpan(at));
                        lang = new string(new[] { (char)(((packed >> 10) & 31) + 0x60), (char)(((packed >> 5) & 31) + 0x60), (char)((packed & 31) + 0x60) });
                    }
                }
                else if (box.Type == "minf")
                {
                    var stbl = Boxes(b, box.Start, box.End).FirstOrDefault(x => x.Type == "stbl");
                    var stsd = stbl.Type == null ? default : Boxes(b, stbl.Start, stbl.End).FirstOrDefault(x => x.Type == "stsd");
                    if (stsd.Type != null && stsd.End - stsd.Start >= 16) entry = Encoding.ASCII.GetString(b, stsd.Start + 12, 4);
                }
            }
            // "text" is also used for chapter tracks; only count it with tx3g subtitle samples.
            var isSub = handler is "sbtl" or "subt" or "clcp" || (handler == "text" && entry == "tx3g");
            if (!isSub) continue;
            var codec = entry switch { "tx3g" => "Timed text", "wvtt" => "WebVTT", "stpp" => "TTML", "c608" or "c708" => "Closed captions", _ => entry ?? handler! };
            list.Add(new EmbeddedSubtitle(Lang(lang ?? "und"), null, codec, false, false));
        }
        return list;
    }

    private static IEnumerable<(string Type, int Start, int End)> Boxes(byte[] b, int start, int end)
    {
        var pos = start;
        while (pos + 8 <= end)
        {
            long size = BinaryPrimitives.ReadUInt32BigEndian(b.AsSpan(pos));
            var type = Encoding.ASCII.GetString(b, pos + 4, 4);
            var header = 8;
            if (size == 1)
            {
                if (pos + 16 > end) yield break;
                size = (long)BinaryPrimitives.ReadUInt64BigEndian(b.AsSpan(pos + 8));
                header = 16;
            }
            else if (size == 0)
            {
                size = end - pos;
            }
            if (size < header || pos + size > end) yield break;
            yield return (type, pos + header, (int)(pos + size));
            pos += (int)size;
        }
    }

    // ---- Languages --------------------------------------------------------------------------

    private static readonly Dictionary<string, string> Iso639 = new(StringComparer.OrdinalIgnoreCase)
    {
        ["eng"] = "en", ["nor"] = "no", ["nob"] = "no", ["nno"] = "no", ["swe"] = "sv", ["dan"] = "da", ["fin"] = "fi",
        ["ice"] = "is", ["isl"] = "is", ["ger"] = "de", ["deu"] = "de", ["dut"] = "nl", ["nld"] = "nl", ["fre"] = "fr",
        ["fra"] = "fr", ["spa"] = "es", ["ita"] = "it", ["por"] = "pt", ["pol"] = "pl", ["cze"] = "cs", ["ces"] = "cs",
        ["hun"] = "hu", ["rum"] = "ro", ["ron"] = "ro", ["gre"] = "el", ["ell"] = "el", ["tur"] = "tr", ["rus"] = "ru",
        ["est"] = "et", ["ara"] = "ar", ["heb"] = "he", ["jpn"] = "ja", ["kor"] = "ko", ["chi"] = "zh", ["zho"] = "zh",
        ["und"] = "", ["unk"] = "", ["mis"] = "", ["zxx"] = "",
    };

    /// <summary>"eng", "en-US", "nob" → "en", "en", "no".</summary>
    private static string Lang(string code)
    {
        var c = code.Trim();
        var dash = c.IndexOf('-');
        if (dash > 0) c = c[..dash];
        if (Iso639.TryGetValue(c, out var two)) return two;
        c = c.ToLowerInvariant();
        return c is "nb" or "nn" ? "no" : c;
    }
}
