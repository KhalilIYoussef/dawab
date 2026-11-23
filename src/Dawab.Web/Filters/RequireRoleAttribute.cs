using Dawab.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Dawab.Web.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireRoleAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly UserRole[] _allowedRoles;

    public RequireRoleAttribute(params UserRole[] allowedRoles)
    {
        _allowedRoles = allowedRoles;
    }

    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var session = context.HttpContext.Session;
        var userId = session.GetString("UserId");
        var roleValue = session.GetString("UserRole");

        if (!Guid.TryParse(userId, out _) || !Enum.TryParse<UserRole>(roleValue, out var role) || !Enum.IsDefined(role))
        {
            session.Clear();
            context.Result = new RedirectToActionResult("Login", "Auth", null);
            return Task.CompletedTask;
        }

        if (_allowedRoles.Length > 0 && !_allowedRoles.Contains(role))
        {
            context.Result = new RedirectToActionResult("Index", "Home", null);
        }

        return Task.CompletedTask;
    }
}
