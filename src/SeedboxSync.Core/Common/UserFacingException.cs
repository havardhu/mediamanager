namespace SeedboxSync.Core.Common;

/// <summary>An error whose message is written for the person using the UI and can be shown as-is.</summary>
public sealed class UserFacingException : Exception
{
    public UserFacingException(string message, int statusCode = 400, Exception? inner = null) : base(message, inner)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
