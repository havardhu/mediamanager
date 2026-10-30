namespace SeedboxSync.Core.Seedbox;

/// <summary>
/// Write-through wrapper that reports how many bytes passed through and aborts the copy when
/// the token is cancelled (used for libraries whose download calls cannot be cancelled).
/// Does not own the inner stream.
/// </summary>
internal sealed class CountingWriteStream : Stream
{
    private readonly Stream _inner;
    private readonly Action<long> _onBytes;
    private readonly CancellationToken _ct;

    public CountingWriteStream(Stream inner, Action<long> onBytes, CancellationToken ct = default)
    {
        _inner = inner;
        _onBytes = onBytes;
        _ct = ct;
    }

    public override bool CanRead => false;
    public override bool CanSeek => false;
    public override bool CanWrite => true;
    public override long Length => _inner.Length;
    public override long Position
    {
        get => _inner.Position;
        set => throw new NotSupportedException();
    }

    public override void Write(byte[] buffer, int offset, int count)
    {
        _ct.ThrowIfCancellationRequested();
        _inner.Write(buffer, offset, count);
        _onBytes(count);
    }

    public override async Task WriteAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
    {
        _ct.ThrowIfCancellationRequested();
        await _inner.WriteAsync(buffer.AsMemory(offset, count), cancellationToken);
        _onBytes(count);
    }

    public override async ValueTask WriteAsync(ReadOnlyMemory<byte> buffer, CancellationToken cancellationToken = default)
    {
        _ct.ThrowIfCancellationRequested();
        await _inner.WriteAsync(buffer, cancellationToken);
        _onBytes(buffer.Length);
    }

    public override void Write(ReadOnlySpan<byte> buffer)
    {
        _ct.ThrowIfCancellationRequested();
        _inner.Write(buffer);
        _onBytes(buffer.Length);
    }

    public override void Flush() => _inner.Flush();
    public override Task FlushAsync(CancellationToken cancellationToken) => _inner.FlushAsync(cancellationToken);
    public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
    public override void SetLength(long value) => throw new NotSupportedException();
}
