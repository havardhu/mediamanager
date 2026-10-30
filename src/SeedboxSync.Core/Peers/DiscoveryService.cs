using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Core.Peers;

/// <summary>Another Seedbox Sync install heard on the LAN.</summary>
public sealed record DiscoveredPeer(string InstanceId, string Name, string Address, string Version, DateTime LastSeenUtc);

/// <summary>
/// Announces this install on the LAN and listens for others, using UDP multicast on every
/// network adapter. Beacons go out every 10 seconds; a newly started install sends a query so
/// everyone answers at once. When a paired PC shows up at a new IP address, its address is
/// updated, so DHCP changes need no attention.
/// </summary>
public sealed class DiscoveryService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(10);
    private static readonly TimeSpan Expiry = TimeSpan.FromSeconds(35);

    private readonly PeerOptions _options;
    private readonly InstanceIdentity _identity;
    private readonly MediaServerRegistry _registry;
    private readonly ILogger<DiscoveryService> _log;
    private readonly object _lock = new();
    private readonly Dictionary<string, DiscoveredPeer> _peers = new();
    private readonly HashSet<string> _joined = new();
    private readonly string _version = typeof(DiscoveryService).Assembly.GetName().Version?.ToString(3) ?? "1.0.0";
    private DateTime _lastAnswer = DateTime.MinValue;
    private UdpClient? _rx;

    public DiscoveryService(PeerOptions options, InstanceIdentity identity, MediaServerRegistry registry, ILogger<DiscoveryService> log)
    {
        _options = options;
        _identity = identity;
        _registry = registry;
        _log = log;
    }

    public bool Enabled => _options.Enabled;

    /// <summary>Installs heard in the last half minute, excluding this one.</summary>
    public IReadOnlyList<DiscoveredPeer> Peers
    {
        get
        {
            var cutoff = DateTime.UtcNow - Expiry;
            lock (_lock) return _peers.Values.Where(p => p.LastSeenUtc > cutoff).OrderBy(p => p.Name).ToList();
        }
    }

    /// <summary>This PC's IPv4 addresses, for adding it by hand when multicast is blocked.</summary>
    public static IReadOnlyList<IPAddress> LocalAddresses() =>
        NetworkInterface.GetAllNetworkInterfaces()
            .Where(n => n.OperationalStatus == OperationalStatus.Up
                && n.SupportsMulticast
                && n.NetworkInterfaceType is not NetworkInterfaceType.Loopback and not NetworkInterfaceType.Tunnel)
            .SelectMany(n => n.GetIPProperties().UnicastAddresses)
            .Select(a => a.Address)
            .Where(a => a.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(a) && !a.ToString().StartsWith("169.254.", StringComparison.Ordinal))
            .Distinct()
            .ToList();

    /// <summary>Asks every install on the LAN to announce itself now.</summary>
    public void Query() => Announce(query: true);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled) return;
        try
        {
            _rx = new UdpClient(AddressFamily.InterNetwork);
            _rx.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            _rx.Client.Bind(new IPEndPoint(IPAddress.Any, _options.DiscoveryPort));
        }
        catch (SocketException ex)
        {
            _log.LogWarning(ex, "LAN discovery is off: UDP port {Port} is not available", _options.DiscoveryPort);
            return;
        }

        JoinGroups();
        var sender = Task.Run(async () =>
        {
            Announce(query: true);
            using var timer = new PeriodicTimer(Interval);
            var ticks = 0;
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                // Adapters come and go (VPN, Wi-Fi); rejoin the group every minute.
                if (++ticks % 6 == 0) JoinGroups();
                Announce(query: false);
            }
        }, stoppingToken);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                UdpReceiveResult r;
                try { r = await _rx.ReceiveAsync(stoppingToken); }
                catch (SocketException ex)
                {
                    // Windows reports ICMP errors from earlier sends as receive errors; keep listening.
                    _log.LogDebug(ex, "Discovery receive error");
                    continue;
                }
                Handle(r);
            }
        }
        catch (OperationCanceledException) { }
        finally
        {
            _rx.Dispose();
            try { await sender; } catch (OperationCanceledException) { }
        }
    }

    private void Handle(UdpReceiveResult r)
    {
        PeerBeacon? b;
        try { b = JsonSerializer.Deserialize<PeerBeacon>(r.Buffer, PeerProtocol.Json); }
        catch (JsonException) { return; }
        if (b == null || b.App != PeerProtocol.AppName || b.V != PeerProtocol.Version || string.IsNullOrEmpty(b.Id)) return;
        if (b.Id == _identity.Id) return;
        var address = PeerProtocol.NormalizeAddress($"{r.RemoteEndPoint.Address}:{b.Port}");
        var peer = new DiscoveredPeer(b.Id, b.Name, address, b.Version, DateTime.UtcNow);
        lock (_lock) _peers[b.Id] = peer;
        _registry.UpdateRemoteAddress(b.Id, address);
        if (b.Query && DateTime.UtcNow - _lastAnswer > TimeSpan.FromSeconds(1)) Announce(query: false);
    }

    private void JoinGroups()
    {
        if (_rx == null) return;
        foreach (var addr in LocalAddresses())
        {
            var key = addr.ToString();
            lock (_lock) if (_joined.Contains(key)) continue;
            try
            {
                _rx.JoinMulticastGroup(PeerProtocol.MulticastGroup, addr);
                lock (_lock) _joined.Add(key);
            }
            catch (SocketException ex)
            {
                _log.LogDebug(ex, "Could not join the discovery group on {Address}", addr);
            }
        }
    }

    private void Announce(bool query)
    {
        if (!_options.Enabled) return;
        _lastAnswer = DateTime.UtcNow;
        var beacon = new PeerBeacon(PeerProtocol.AppName, PeerProtocol.Version, _identity.Id, _registry.Local.Name, _options.Port, _version, query);
        var bytes = JsonSerializer.SerializeToUtf8Bytes(beacon, PeerProtocol.Json);
        var target = new IPEndPoint(PeerProtocol.MulticastGroup, _options.DiscoveryPort);
        foreach (var addr in LocalAddresses())
        {
            try
            {
                // One socket per adapter, so the beacon reaches every network this PC is on.
                using var tx = new UdpClient(new IPEndPoint(addr, 0));
                tx.Client.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.MulticastInterface, addr.GetAddressBytes());
                tx.Client.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.MulticastTimeToLive, 1);
                tx.Send(bytes, bytes.Length, target);
            }
            catch (SocketException ex)
            {
                _log.LogDebug(ex, "Could not announce on {Address}", addr);
            }
        }
    }
}
