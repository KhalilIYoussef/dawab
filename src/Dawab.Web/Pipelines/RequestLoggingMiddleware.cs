using System.Diagnostics;

namespace Dawab.Web.Pipelines;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        await _next(context);
        
        stopwatch.Stop();
        if (stopwatch.ElapsedMilliseconds > 500)
        {
            _logger.LogWarning("طلب استغرق وقتاً طويلاً: {Method} {Path} استغرق {Elapsed}ms", 
                context.Request.Method, context.Request.Path, stopwatch.ElapsedMilliseconds);
        }
    }
}
