using SeedboxSync.Core.Common;
using SeedboxSync.Core.Nodes;

namespace SeedboxSync.Service;

/// <summary>Every API error is returned as { "message": "..." } so the UI can show it in the notification bar.</summary>
public sealed class ErrorMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorMiddleware> _log;

    public ErrorMiddleware(RequestDelegate next, ILogger<ErrorMiddleware> log)
    {
        _next = next;
        _log = log;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UserFacingException ex)
        {
            await WriteAsync(context, ex.StatusCode, ex.Message);
        }
        catch (RemoteNodeException ex)
        {
            // Another PC on the LAN is off or not answering.
            await WriteAsync(context, 502, ex.Message);
        }
        catch (ArgumentException ex)
        {
            await WriteAsync(context, 400, ex.Message);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // The browser went away; nothing to report.
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unhandled error for {Path}", context.Request.Path);
            await WriteAsync(context, 500, "Unexpected error: " + ex.Message);
        }
    }

    private static async Task WriteAsync(HttpContext context, int status, string message)
    {
        if (context.Response.HasStarted) return;
        context.Response.Clear();
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new { message });
    }
}
