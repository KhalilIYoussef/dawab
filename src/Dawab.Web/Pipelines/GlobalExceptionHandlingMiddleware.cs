using System.Net;

namespace Dawab.Web.Pipelines;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "حدث خطأ غير متوقع أثناء معالجة الطلب: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // If it's an HTMX request, return clean HTML error banner
        if (context.Request.Headers.ContainsKey("HX-Request"))
        {
            var html = $@"
            <div class='p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2'>
                <span>حدث خطأ: {exception.Message}</span>
            </div>";
            return context.Response.WriteAsync(html);
        }

        // Redirect or format standard error
        context.Response.Redirect($"/Home/Error?message={WebUtility.UrlEncode(exception.Message)}");
        return Task.CompletedTask;
    }
}
