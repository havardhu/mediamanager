using Microsoft.Extensions.Hosting.WindowsServices;

namespace SeedboxSync.Service;

public static class ServiceInfo
{
    public const string ServiceName = "SeedboxSync";

    public static string Version => typeof(ServiceInfo).Assembly.GetName().Version?.ToString(3) ?? "1.0.0";

    public static bool IsWindowsService => WindowsServiceHelpers.IsWindowsService();
}
