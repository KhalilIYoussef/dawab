using Dawab.Application.Common.Interfaces;
using Dawab.Domain.Enums;
using Dawab.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Web.Controllers;

[RequireRole(UserRole.Admin, UserRole.Breeder, UserRole.Investor)]
public class AccountController : Controller
{
    private readonly IApplicationDbContext _context;

    public AccountController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Profile()
    {
        if (!Guid.TryParse(HttpContext.Session.GetString("UserId"), out var userId))
        {
            return RedirectToAction("Login", "Auth");
        }

        var user = await _context.Users
            .Include(account => account.BreederProfile)
            .Include(account => account.KycDocument)
            .SingleOrDefaultAsync(account => account.Id == userId);

        if (user == null)
        {
            HttpContext.Session.Clear();
            TempData["ErrorMessage"] = "تعذر العثور على الحساب الحالي. يرجى تسجيل الدخول مرة أخرى.";
            return RedirectToAction("Login", "Auth");
        }

        return View(user);
    }
}
