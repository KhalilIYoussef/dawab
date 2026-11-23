using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Auth;
using Dawab.Domain.Enums;
using Dawab.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dawab.Web.Controllers;

public class AuthController : Controller
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View(new LoginViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var result = await _authService.LoginAsync(new LoginDto
        {
            Phone = model.Phone,
            Password = model.Password
        });

        if (result == null)
        {
            ModelState.AddModelError(string.Empty, "رقم الهاتف أو كلمة المرور غير صحيحة.");
            return View(model);
        }

        HttpContext.Session.SetString("UserId", result.UserId.ToString());
        HttpContext.Session.SetString("UserName", result.Name);
        HttpContext.Session.SetString("UserRole", result.Role.ToString());

        TempData["SuccessMessage"] = $"مرحباً بعودتك يا {result.Name}!";
        return RedirectToRoleDashboard(result.Role);
    }

    [HttpGet]
    public IActionResult Register(string? role)
    {
        var selectedRole = Enum.TryParse<UserRole>(role, true, out var parsedRole)
            && (parsedRole == UserRole.Investor || parsedRole == UserRole.Breeder)
                ? parsedRole
                : UserRole.Investor;

        return View(new RegisterViewModel { Role = selectedRole });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (model.Role != UserRole.Investor && model.Role != UserRole.Breeder)
        {
            ModelState.AddModelError(nameof(model.Role), "إنشاء حساب متاح للمستثمر أو المربي فقط.");
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var result = await _authService.RegisterAsync(new RegisterDto
            {
                Name = model.Name,
                Phone = model.Phone,
                Password = model.Password,
                Role = model.Role,
                Governorate = model.Governorate,
                FarmName = model.FarmName,
                NationalId = model.NationalId,
                BankName = model.BankName,
                Iban = model.Iban
            });

            HttpContext.Session.SetString("UserId", result.UserId.ToString());
            HttpContext.Session.SetString("UserName", result.Name);
            HttpContext.Session.SetString("UserRole", result.Role.ToString());

            TempData["SuccessMessage"] = "تم إنشاء الحساب بنجاح وهو الآن قيد المراجعة والتحقق.";
            return RedirectToRoleDashboard(result.Role);
        }
        catch (Exception ex)
        {
            ModelState.AddModelError(string.Empty, ex.Message);
            return View(model);
        }
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        TempData["SuccessMessage"] = "تم تسجيل الخروج بنجاح.";
        return RedirectToAction("Index", "Home");
    }

    private IActionResult RedirectToRoleDashboard(UserRole role)
    {
        return role switch
        {
            UserRole.Admin => RedirectToAction("Dashboard", "Admin"),
            UserRole.Breeder => RedirectToAction("Dashboard", "Breeder"),
            UserRole.Investor => RedirectToAction("Dashboard", "Investments"),
            _ => RedirectToAction("Index", "Home")
        };
    }
}
