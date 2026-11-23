using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Investments;
using Dawab.Domain.Enums;
using Dawab.Web.Filters;
using Dawab.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Web.Controllers;

[RequireRole(UserRole.Investor)]
public class InvestmentsController : Controller
{
    private readonly IInvestmentService _investmentService;
    private readonly ICycleService _cycleService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IApplicationDbContext _context;

    public InvestmentsController(
        IInvestmentService investmentService,
        ICycleService cycleService,
        IFileStorageService fileStorageService,
        IApplicationDbContext context)
    {
        _investmentService = investmentService;
        _cycleService = cycleService;
        _fileStorageService = fileStorageService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Dashboard()
    {
        if (!Guid.TryParse(HttpContext.Session.GetString("UserId"), out var userId))
        {
            return RedirectToAction("Login", "Auth");
        }

        var user = await _context.Users.AsNoTracking().SingleOrDefaultAsync(account => account.Id == userId);
        if (user == null)
        {
            HttpContext.Session.Clear();
            TempData["ErrorMessage"] = "تعذر العثور على الحساب الحالي. يرجى تسجيل الدخول مرة أخرى.";
            return RedirectToAction("Login", "Auth");
        }

        var model = new InvestorDashboardViewModel
        {
            AccountStatus = user.Status,
            AvailableCycles = await _cycleService.GetAllCyclesAsync(CycleStatus.Funding),
            Investments = await _investmentService.GetInvestorPortfolioAsync(userId)
        };

        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Portfolio()
    {
        if (!Guid.TryParse(HttpContext.Session.GetString("UserId"), out var userId))
        {
            return RedirectToAction("Login", "Auth");
        }

        var investments = await _investmentService.GetInvestorPortfolioAsync(userId);
        return View(investments);
    }

    // HTMX: Load Investment Modal
    [HttpGet]
    public async Task<IActionResult> InvestModal(Guid cycleId)
    {
        var cycle = await _cycleService.GetCycleByIdAsync(cycleId);
        if (cycle == null || cycle.Status != CycleStatus.Funding || cycle.RemainingFunding <= 0)
        {
            return NotFound();
        }

        var feeCalc = await _investmentService.CalculateFeesAsync(cycle.StartPricePerHead, true);

        var model = new InvestModalViewModel
        {
            Cycle = cycle,
            Amount = cycle.StartPricePerHead,
            HeadsCount = 1,
            HasAnimalInsurance = true,
            PlatformFee = feeCalc.PlatformFee,
            AnimalInsuranceFee = feeCalc.AnimalInsuranceFee,
            TotalAmountToPay = feeCalc.TotalAmountToPay
        };

        return PartialView("_InvestModalPartial", model);
    }

    // HTMX: Dynamic Live Fee Calculation
    [HttpGet]
    public async Task<IActionResult> CalculateFee(decimal amount, bool hasInsurance)
    {
        var fee = await _investmentService.CalculateFeesAsync(amount, hasInsurance);
        return PartialView("_FeeBreakdownPartial", fee);
    }

    // POST: Submit Investment with bank transfer receipt
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit(CreateInvestmentDto dto, IFormFile? receiptFile)
    {
        var userId = Guid.Parse(HttpContext.Session.GetString("UserId")!);
        var investor = await _context.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Id == userId);
        if (investor == null)
        {
            HttpContext.Session.Clear();
            TempData["ErrorMessage"] = "تعذر العثور على الحساب الحالي. يرجى تسجيل الدخول مرة أخرى.";
            return RedirectToAction("Login", "Auth");
        }

        if (investor.Status != UserStatus.Active)
        {
            TempData["ErrorMessage"] = "يجب تفعيل حسابك من الإدارة قبل إرسال طلب استثمار.";
            return RedirectToAction("Dashboard");
        }

        if (receiptFile == null || receiptFile.Length == 0)
        {
            TempData["ErrorMessage"] = "يرجى إرفاق إيصال التحويل قبل إرسال طلب الاستثمار.";
            return RedirectToAction("Dashboard");
        }

        if (receiptFile.Length > 0)
        {
            using var stream = receiptFile.OpenReadStream();
            dto.TransferReceiptUrl = await _fileStorageService.SaveFileAsync(stream, receiptFile.FileName, "receipts");
        }

        try
        {
            await _investmentService.CreateInvestmentAsync(userId, dto);
            TempData["SuccessMessage"] = "تم إرسال طلب الاستثمار بنجاح! سيتم مراجعة إيصال التحويل واعتماده من قبل الإدارة فوراً.";
        }
        catch (Exception ex)
        {
            TempData["ErrorMessage"] = ex.Message;
        }

        return RedirectToAction("Portfolio");
    }
}
