using SeedboxSync.Core.Transfers;

namespace SeedboxSync.Service.Endpoints;

public sealed record PauseRequest(bool Paused);

public static class TransferEndpoints
{
    public static void MapTransferEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/transfers", (TransferQueue q) => new { paused = q.Paused, items = q.Snapshot() });

        api.MapPost("/transfers/pause", (PauseRequest req, TransferQueue q) =>
        {
            q.SetPaused(req.Paused);
            return new { paused = q.Paused, items = q.Snapshot() };
        });

        api.MapPost("/transfers/{id}/cancel", (string id, TransferQueue q) =>
        {
            q.Cancel(id);
            return Results.NoContent();
        });

        api.MapPost("/transfers/{id}/retry", (string id, TransferQueue q) =>
        {
            q.Retry(id);
            return Results.NoContent();
        });

        api.MapPost("/transfers/clear", (TransferQueue q) => new { cleared = q.ClearFinished() });
    }
}
