using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using SeedboxSync.Core.Common;
using SeedboxSync.Core.Configuration;

namespace SeedboxSync.Core.Peers;

/// <summary>This install's permanent ID, so other PCs recognise it when its IP address changes.</summary>
public sealed class InstanceIdentity
{
    private sealed class Stored
    {
        public string Id { get; set; } = string.Empty;
    }

    public InstanceIdentity(AppPaths paths)
    {
        var file = Path.Combine(paths.DataDirectory, "instance.json");
        var s = JsonFileStore.Read<Stored>(file);
        if (s == null || string.IsNullOrWhiteSpace(s.Id))
        {
            s = new Stored { Id = Guid.NewGuid().ToString("N") };
            JsonFileStore.Write(file, s);
        }
        Id = s.Id;
    }

    public string Id { get; }
}

/// <summary>
/// The self-signed certificate the LAN port serves. It is created once and kept (DPAPI-encrypted)
/// in the data directory. PCs that add this one pin its SHA-256 thumbprint at pairing, so nothing
/// else on the network can pose as it later.
/// </summary>
public sealed class PeerCertificate
{
    private readonly string _file;

    public PeerCertificate(AppPaths paths)
    {
        _file = Path.Combine(paths.DataDirectory, "peer-certificate.dat");
        Certificate = LoadOrCreate();
        Thumbprint = PeerProtocol.Thumbprint(Certificate);
    }

    public X509Certificate2 Certificate { get; }
    public string Thumbprint { get; }

    private X509Certificate2 LoadOrCreate()
    {
        if (File.Exists(_file))
        {
            try
            {
                var b64 = SecretProtector.Unprotect(File.ReadAllText(_file));
                if (b64.Length > 0) return Import(Convert.FromBase64String(b64));
            }
            catch (Exception ex) when (ex is CryptographicException or FormatException or IOException)
            {
                // Unreadable (for example copied from another PC): make a new one. Paired PCs then
                // report a changed certificate and need to add this PC again.
            }
        }
        using var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        var req = new CertificateRequest($"CN=Seedbox Sync {Environment.MachineName}", key, HashAlgorithmName.SHA256);
        req.CertificateExtensions.Add(new X509BasicConstraintsExtension(false, false, 0, false));
        req.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, false));
        req.CertificateExtensions.Add(new X509EnhancedKeyUsageExtension(new OidCollection { new Oid("1.3.6.1.5.5.7.3.1") }, false));
        var san = new SubjectAlternativeNameBuilder();
        san.AddDnsName(Environment.MachineName);
        san.AddDnsName("localhost");
        req.CertificateExtensions.Add(san.Build());
        using var created = req.CreateSelfSigned(DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddYears(20));
        // Export and re-import: Windows TLS (SChannel) cannot use the in-memory key directly.
        var pfx = created.Export(X509ContentType.Pkcs12);
        File.WriteAllText(_file, SecretProtector.Protect(Convert.ToBase64String(pfx)));
        return Import(pfx);
    }

    private static X509Certificate2 Import(byte[] pfx) =>
        X509CertificateLoader.LoadPkcs12(pfx, null, X509KeyStorageFlags.Exportable);
}
