using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Security;
using System.Security.Authentication;
using System.Text.Json;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Peers;

namespace SeedboxSync.Core.Nodes;

/// <summary>
/// A remote PC could not be reached or failed mid-call. Transfers retry these; the message is
/// written for the UI.
/// </summary>
public sealed class RemoteNodeException : Exception
{
    public RemoteNodeException(string message, Exception? inner = null) : base(message, inner) { }
}

/// <summary>
/// Another PC running Seedbox Sync, used as a media server through its peer API (HTTPS on the LAN
/// port, certificate pinned at pairing, per-PC key). That PC runs a <see cref="LocalMediaNode"/>
/// for its own disk, so every operation here is the same code running over there. Downloads go
/// straight from the seedbox to that PC.
/// </summary>
public sealed class RemoteMediaNode : IMediaNode, IDisposable
{
    private static readonly TimeSpan CallTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan ScanTimeout = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan DownloadSilence = TimeSpan.FromSeconds(60);

    private readonly MediaServerConfig _cfg;
    private readonly HttpClient _http;
    private DateTime _lastOkUtc;
    private DateTime _lastFailUtc;
    private string _lastVersion = string.Empty;

    public RemoteMediaNode(MediaServerConfig cfg, string managerId)
    {
        _cfg = cfg;
        _http = CreateClient(cfg.CertThumbprint ?? string.Empty);
        _http.BaseAddress = new Uri((cfg.Address ?? string.Empty).TrimEnd('/') + PeerProtocol.ApiPrefix + "/");
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", cfg.AgentKey ?? string.Empty);
        _http.DefaultRequestHeaders.Add(PeerProtocol.PeerIdHeader, managerId);
    }

    public string ServerId => _cfg.Id;

    /// <summary>True when the last call failed and nothing has succeeded since, within the last minute.</summary>
    public bool KnownOffline => _lastFailUtc > _lastOkUtc && DateTime.UtcNow - _lastFailUtc < TimeSpan.FromMinutes(1);

    /// <summary>HTTPS client that accepts exactly one certificate: the one pinned at pairing.</summary>
    public static HttpClient CreateClient(string thumbprint) => new(new SocketsHttpHandler
    {
        ConnectTimeout = TimeSpan.FromSeconds(5),
        PooledConnectionLifetime = TimeSpan.FromMinutes(5),
        SslOptions = new SslClientAuthenticationOptions
        {
            RemoteCertificateValidationCallback = (_, cert, _, _) =>
                cert != null && string.Equals(PeerProtocol.Thumbprint(cert), thumbprint, StringComparison.OrdinalIgnoreCase),
        },
    })
    {
        Timeout = Timeout.InfiniteTimeSpan,
    };

    public async Task<NodeStatus> GetStatusAsync(CancellationToken ct)
    {
        try
        {
            var info = await CallAsync(c => GetJsonAsync<PeerInfo>("status", c), TimeSpan.FromSeconds(8), ct);
            _lastVersion = info?.Version ?? _lastVersion;
            var s = info?.Status ?? throw new RemoteNodeException("Empty answer.");
            return s with { Online = true, Version = "Service " + info.Version, LastSeenUtc = DateTime.UtcNow };
        }
        catch (Exception ex) when (ex is RemoteNodeException or UserFacingException)
        {
            return new NodeStatus(false, _cfg.LibraryRoot, null, null, _lastVersion.Length > 0 ? "Service " + _lastVersion : string.Empty,
                _lastOkUtc == default ? null : _lastOkUtc, ex.Message);
        }
    }

    public async Task<IReadOnlyList<NodeFile>> ScanAsync(CancellationToken ct)
    {
        if (KnownOffline) throw new RemoteNodeException($"{_cfg.Name} is offline.");
        var files = await CallAsync(c => GetJsonAsync<List<NodeFile>>("files", c), ScanTimeout, ct);
        return files ?? new List<NodeFile>();
    }

    public Task<NodeFile?> GetFileAsync(string relativePath, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var res = await _http.GetAsync("file?path=" + Uri.EscapeDataString(relativePath), c);
            if (res.StatusCode == HttpStatusCode.NotFound) return null;
            await EnsureOkAsync(res, c);
            return await res.Content.ReadFromJsonAsync<NodeFile>(PeerProtocol.Json, c);
        }, CallTimeout, ct);

    public async Task<Stream> OpenReadAsync(string relativePath, CancellationToken ct)
    {
        var res = await CallAsync(async c =>
        {
            var r = await _http.GetAsync("stream?path=" + Uri.EscapeDataString(relativePath), HttpCompletionOption.ResponseHeadersRead, c);
            if (!r.IsSuccessStatusCode)
            {
                using (r) await EnsureOkAsync(r, c);
            }
            return r;
        }, CallTimeout, ct);
        return new ResponseStream(res, await res.Content.ReadAsStreamAsync(ct));
    }

    public Task<byte[]> ReadRangeAsync(string relativePath, long offset, int count, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var msg = new HttpRequestMessage(HttpMethod.Get, "stream?path=" + Uri.EscapeDataString(relativePath));
            msg.Headers.Range = new RangeHeaderValue(offset, offset + count - 1);
            using var res = await _http.SendAsync(msg, HttpCompletionOption.ResponseHeadersRead, c);
            await EnsureOkAsync(res, c);
            await using var s = await res.Content.ReadAsStreamAsync(c);
            if (res.StatusCode != HttpStatusCode.PartialContent && offset > 0)
                throw new RemoteNodeException($"{_cfg.Name} does not support partial reads.");
            var buffer = new byte[count];
            var read = await s.ReadAtLeastAsync(buffer, count, throwOnEndOfStream: false, c);
            return read == count ? buffer : buffer[..read];
        }, CallTimeout, ct);

    public Task WriteFileAsync(string relativePath, Stream content, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var body = new StreamContent(content);
            using var res = await _http.PutAsync("file?path=" + Uri.EscapeDataString(relativePath), body, c);
            await EnsureOkAsync(res, c);
            return true;
        }, CallTimeout, ct);

    public async Task<NodeFile> DownloadFromSeedboxAsync(NodeDownloadRequest request, Action<long> onPosition, CancellationToken ct)
    {
        // One long request: the other PC streams a progress line every few seconds while it
        // downloads. Cancelling here closes the connection, which cancels the download there.
        using var watchdog = CancellationTokenSource.CreateLinkedTokenSource(ct);
        watchdog.CancelAfter(DownloadSilence);
        try
        {
            using var msg = new HttpRequestMessage(HttpMethod.Post, "download") { Content = JsonContent.Create(request, options: PeerProtocol.Json) };
            using var res = await _http.SendAsync(msg, HttpCompletionOption.ResponseHeadersRead, watchdog.Token);
            await EnsureOkAsync(res, watchdog.Token);
            MarkOk();
            await using var stream = await res.Content.ReadAsStreamAsync(watchdog.Token);
            using var reader = new StreamReader(stream);
            while (true)
            {
                var line = await reader.ReadLineAsync(watchdog.Token);
                if (line == null) throw new RemoteNodeException($"{_cfg.Name} closed the connection during the download.");
                watchdog.CancelAfter(DownloadSilence);
                if (line.Length == 0) continue;
                var p = JsonSerializer.Deserialize<DownloadProgress>(line, PeerProtocol.Json);
                if (p == null) continue;
                if (p.Error != null)
                {
                    if (p.Retryable) throw new RemoteNodeException($"{_cfg.Name}: {p.Error}");
                    throw new UserFacingException($"{_cfg.Name}: {p.Error}");
                }
                if (p.Position is { } pos) onPosition(pos);
                if (p.Done) return p.File ?? throw new RemoteNodeException($"{_cfg.Name} did not report the finished file.");
            }
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            MarkFail();
            throw new RemoteNodeException($"{_cfg.Name} stopped responding during the download.");
        }
        catch (Exception ex) when (ex is HttpRequestException or IOException or AuthenticationException)
        {
            MarkFail();
            throw Unreachable(ex);
        }
    }

    public Task DiscardPartialAsync(string relativePath, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var res = await _http.DeleteAsync("partial?path=" + Uri.EscapeDataString(relativePath), c);
            await EnsureOkAsync(res, c);
            return true;
        }, CallTimeout, ct);

    public Task<MediaTags?> ReadTagsAsync(string relativePath, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var res = await _http.GetAsync("tags?path=" + Uri.EscapeDataString(relativePath), c);
            if (res.StatusCode == HttpStatusCode.NoContent) return null;
            await EnsureOkAsync(res, c);
            return await res.Content.ReadFromJsonAsync<MediaTags>(PeerProtocol.Json, c);
        }, CallTimeout, ct);

    public Task OpenWithDefaultPlayerAsync(string relativePath, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var res = await _http.PostAsync("open?path=" + Uri.EscapeDataString(relativePath), null, c);
            await EnsureOkAsync(res, c);
            return true;
        }, CallTimeout, ct);

    /// <summary>Changes the library folder on that PC.</summary>
    public Task SetLibraryRootAsync(string root, CancellationToken ct) =>
        CallAsync(async c =>
        {
            using var res = await _http.PutAsJsonAsync("libraryroot", new LibraryRootRequest(root), PeerProtocol.Json, c);
            await EnsureOkAsync(res, c);
            return true;
        }, CallTimeout, ct);

    /// <summary>Tells that PC to forget this one. Best effort: it may be off.</summary>
    public async Task UnpairAsync(CancellationToken ct)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            using var res = await _http.DeleteAsync("pair", cts.Token);
        }
        catch (Exception ex) when (ex is HttpRequestException or OperationCanceledException or IOException) { }
    }

    public void Dispose() => _http.Dispose();

    private async Task<T> CallAsync<T>(Func<CancellationToken, Task<T>> call, TimeSpan timeout, CancellationToken ct)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(timeout);
        try
        {
            var result = await call(cts.Token);
            MarkOk();
            return result;
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            MarkFail();
            throw new RemoteNodeException($"{_cfg.Name} did not answer in time.");
        }
        catch (Exception ex) when (ex is HttpRequestException or IOException or AuthenticationException or JsonException)
        {
            MarkFail();
            throw Unreachable(ex);
        }
    }

    private async Task<T?> GetJsonAsync<T>(string uri, CancellationToken ct)
    {
        using var res = await _http.GetAsync(uri, ct);
        await EnsureOkAsync(res, ct);
        return await res.Content.ReadFromJsonAsync<T>(PeerProtocol.Json, ct);
    }

    private RemoteNodeException Unreachable(Exception ex)
    {
        for (var e = ex; e != null; e = e.InnerException)
        {
            if (e is AuthenticationException)
                return new RemoteNodeException($"{_cfg.Name} presented a different certificate than when it was added. If Seedbox Sync was reinstalled there, remove the server and add it again.", ex);
        }
        return new RemoteNodeException($"Could not reach {_cfg.Name} at {_cfg.Address}. Check that the PC is on, Seedbox Sync is running there, and the firewall allows it.", ex);
    }

    private async Task EnsureOkAsync(HttpResponseMessage res, CancellationToken ct)
    {
        if (res.IsSuccessStatusCode) return;
        string? message = null;
        try
        {
            var body = await res.Content.ReadFromJsonAsync<JsonElement>(PeerProtocol.Json, ct);
            if (body.ValueKind == JsonValueKind.Object && body.TryGetProperty("message", out var m)) message = m.GetString();
        }
        catch (Exception ex) when (ex is JsonException or NotSupportedException or HttpRequestException) { }
        var status = (int)res.StatusCode;
        if (res.StatusCode == HttpStatusCode.Unauthorized)
            throw new UserFacingException($"{_cfg.Name} no longer accepts this PC. Remove the server and add it again with a new pairing code.", 502);
        if (status >= 500) throw new RemoteNodeException($"{_cfg.Name}: {message ?? res.ReasonPhrase}");
        throw new UserFacingException($"{_cfg.Name}: {message ?? res.ReasonPhrase}", status == 404 ? 404 : 400);
    }

    private void MarkOk() => _lastOkUtc = DateTime.UtcNow;

    private void MarkFail() => _lastFailUtc = DateTime.UtcNow;

    /// <summary>Response body that also disposes the response.</summary>
    private sealed class ResponseStream : Stream
    {
        private readonly HttpResponseMessage _res;
        private readonly Stream _inner;

        public ResponseStream(HttpResponseMessage res, Stream inner)
        {
            _res = res;
            _inner = inner;
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => _res.Content.Headers.ContentLength ?? throw new NotSupportedException();
        public override long Position { get => throw new NotSupportedException(); set => throw new NotSupportedException(); }
        public override int Read(byte[] buffer, int offset, int count) => _inner.Read(buffer, offset, count);
        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken ct) => _inner.ReadAsync(buffer, offset, count, ct);
        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken ct = default) => _inner.ReadAsync(buffer, ct);
        public override void Flush() { }
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _inner.Dispose();
                _res.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
