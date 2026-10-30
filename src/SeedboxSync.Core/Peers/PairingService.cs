using System.Security.Cryptography;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;

namespace SeedboxSync.Core.Peers;

public sealed record PairingCode(string Code, DateTime ExpiresUtc);

/// <summary>A PC that has added this one and may use its peer API.</summary>
public sealed record ManagerDto(string Id, string Name, DateTime PairedUtc, DateTime? LastSeenUtc, string? LastAddress);

/// <summary>
/// This PC's side of pairing: shows a short code on request, and keeps the list of PCs that
/// have added it (managers.json, keys encrypted). Each manager gets its own key, so removing one
/// does not affect the others.
/// </summary>
public sealed class PairingService
{
    // No 0/O, 1/I/L, 2/Z, 5/S or 8/B, so the code is easy to read off a screen.
    private const string Alphabet = "ACDEFGHJKMNPQRTUVWXY34679";
    private const int MaxAttempts = 5;
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(10);

    private sealed class Manager
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public DateTime PairedUtc { get; set; }
        public DateTime? LastSeenUtc { get; set; }
        public string? LastAddress { get; set; }
    }

    private readonly string _file;
    private readonly PeerCertificate _cert;
    private readonly object _lock = new();
    private readonly List<Manager> _managers;
    private string? _code;
    private DateTime _codeExpires;
    private int _attempts;
    private DateTime _lastPersist = DateTime.MinValue;

    public PairingService(AppPaths paths, PeerCertificate cert)
    {
        _file = Path.Combine(paths.DataDirectory, "managers.json");
        _cert = cert;
        _managers = JsonFileStore.Read<List<Manager>>(_file) ?? new List<Manager>();
        foreach (var m in _managers) m.Key = SecretProtector.Unprotect(m.Key);
        _managers.RemoveAll(m => string.IsNullOrEmpty(m.Key) || string.IsNullOrEmpty(m.Id));
    }

    public PairingCode? Current
    {
        get
        {
            lock (_lock) return _code != null && DateTime.UtcNow < _codeExpires ? new PairingCode(Format(_code), _codeExpires) : null;
        }
    }

    public PairingCode Start()
    {
        lock (_lock)
        {
            _code = new string(Enumerable.Range(0, 6).Select(_ => Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]).ToArray());
            _codeExpires = DateTime.UtcNow + CodeLifetime;
            _attempts = 0;
            return new PairingCode(Format(_code), _codeExpires);
        }
    }

    public void Cancel()
    {
        lock (_lock) _code = null;
    }

    /// <summary>Checks the proof against the current code and issues a key for the caller.</summary>
    public string Pair(PairRequest req, string? remoteAddress)
    {
        if (string.IsNullOrWhiteSpace(req.ManagerId) || string.IsNullOrWhiteSpace(req.Proof))
            throw new UserFacingException("Incomplete pairing request.");
        lock (_lock)
        {
            if (_code == null || DateTime.UtcNow >= _codeExpires)
                throw new UserFacingException($"{Environment.MachineName} is not accepting new PCs right now. On that PC, open Servers and choose Show pairing code.", 403);
            var expected = PeerProtocol.PairingProof(_code, _cert.Thumbprint, req.ManagerId);
            if (!PeerProtocol.FixedTimeEquals(expected, req.Proof.ToUpperInvariant()))
            {
                if (++_attempts >= MaxAttempts) _code = null;
                throw new UserFacingException(_code == null
                    ? "Wrong pairing code too many times. Show a new code on the other PC and try again."
                    : "The pairing code is wrong. Check the code shown on the other PC.", 403);
            }
            _code = null;
            var key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            _managers.RemoveAll(m => m.Id == req.ManagerId);
            _managers.Add(new Manager
            {
                Id = req.ManagerId,
                Name = string.IsNullOrWhiteSpace(req.ManagerName) ? "Unknown PC" : req.ManagerName.Trim(),
                Key = key,
                PairedUtc = DateTime.UtcNow,
                LastSeenUtc = DateTime.UtcNow,
                LastAddress = remoteAddress,
            });
            Persist();
            return key;
        }
    }

    public bool Authenticate(string? managerId, string? key, string? remoteAddress)
    {
        if (string.IsNullOrEmpty(managerId) || string.IsNullOrEmpty(key)) return false;
        lock (_lock)
        {
            var m = _managers.FirstOrDefault(x => x.Id == managerId);
            if (m == null || !PeerProtocol.FixedTimeEquals(m.Key, key)) return false;
            m.LastSeenUtc = DateTime.UtcNow;
            m.LastAddress = remoteAddress;
            // "Last seen" is informational; write it at most every few minutes.
            if (DateTime.UtcNow - _lastPersist > TimeSpan.FromMinutes(5)) Persist();
            return true;
        }
    }

    public IReadOnlyList<ManagerDto> Managers
    {
        get
        {
            lock (_lock)
                return _managers.OrderBy(m => m.Name).Select(m => new ManagerDto(m.Id, m.Name, m.PairedUtc, m.LastSeenUtc, m.LastAddress)).ToList();
        }
    }

    public void Remove(string managerId)
    {
        lock (_lock)
        {
            if (_managers.RemoveAll(m => m.Id == managerId) > 0) Persist();
        }
    }

    private static string Format(string code) => code[..3] + "-" + code[3..];

    private void Persist()
    {
        _lastPersist = DateTime.UtcNow;
        JsonFileStore.Write(_file, _managers.Select(m => new Manager
        {
            Id = m.Id,
            Name = m.Name,
            Key = SecretProtector.Protect(m.Key),
            PairedUtc = m.PairedUtc,
            LastSeenUtc = m.LastSeenUtc,
            LastAddress = m.LastAddress,
        }).ToList());
    }
}
