using System.Buffers.Binary;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Core.Subtitles;

/// <summary>
/// The OpenSubtitles file hash: file size plus the sum of the first and last 64 KB read as
/// little-endian 64-bit words. Subtitles registered with the same hash were timed against this
/// exact file, so they are in sync.
/// </summary>
public static class OpenSubtitlesHash
{
    private const int Chunk = 64 * 1024;

    public static async Task<string?> ComputeAsync(IMediaNode node, string relativePath, long size, CancellationToken ct)
    {
        if (size < Chunk * 2) return null;
        var head = await node.ReadRangeAsync(relativePath, 0, Chunk, ct);
        var tail = await node.ReadRangeAsync(relativePath, size - Chunk, Chunk, ct);
        if (head.Length != Chunk || tail.Length != Chunk) return null;
        return Compute(size, head, tail);
    }

    public static string Compute(long size, ReadOnlySpan<byte> head, ReadOnlySpan<byte> tail)
    {
        var hash = unchecked((ulong)size);
        for (var i = 0; i + 8 <= head.Length; i += 8) hash = unchecked(hash + BinaryPrimitives.ReadUInt64LittleEndian(head[i..]));
        for (var i = 0; i + 8 <= tail.Length; i += 8) hash = unchecked(hash + BinaryPrimitives.ReadUInt64LittleEndian(tail[i..]));
        return hash.ToString("x16");
    }
}
