using Dawab.Application.Common.Interfaces;
using Dawab.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Dawab.Web.Controllers;

public class HomeController : Controller
{
    private readonly IHomeService _homeService;

    public HomeController(IHomeService homeService)
    {
        _homeService = homeService;
    }

    public async Task<IActionResult> Index()
    {
        var userId = HttpContext.Session.GetString("UserId");
        var roleValue = HttpContext.Session.GetString("UserRole");
        if (!string.IsNullOrEmpty(userId))
        {
            if (!Guid.TryParse(userId, out _) || !Enum.TryParse<UserRole>(roleValue, out var role) || !Enum.IsDefined(role))
            {
                HttpContext.Session.Clear();
                return RedirectToAction("Login", "Auth");
            }

            return role switch
            {
                UserRole.Admin => RedirectToAction("Dashboard", "Admin"),
                UserRole.Breeder => RedirectToAction("Dashboard", "Breeder"),
                UserRole.Investor => RedirectToAction("Dashboard", "Investments"),
                _ => RedirectToAction("Login", "Auth")
            };
        }

        var model = await _homeService.GetHomeDataAsync();
        return View(model);
    }

    [HttpGet]
    public IActionResult Onboarding()
    {
        if (HttpContext.Session.GetString("UserId") != null)
        {
            return RedirectToAction("Index");
        }

        return View();
    }

    [HttpGet]
    public IActionResult Splash()
    {
        if (HttpContext.Session.GetString("UserId") != null)
        {
            return RedirectToAction("Index");
        }

        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    public IActionResult Error(string? message)
    {
        ViewBag.ErrorMessage = message;
        return View();
    }
}
