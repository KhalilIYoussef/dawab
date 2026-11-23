using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Settlements;
using Dawab.Web.Filters;
using Dawab.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dawab.Web.Controllers;

[RequireRole(Dawab.Domain.Enums.UserRole.Admin)]
public class AdminController : Controller
{
    private readonly IAdminService _adminService;
    private readonly ICycleService _cycleService;

    public AdminController(IAdminService adminService, ICycleService cycleService)
    {
        _adminService = adminService;
        _cycleService = cycleService;
    }

    [HttpGet]
    public async Task<IActionResult> Dashboard()
    {
        var model = await _adminService.GetDashboardDataAsync();
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> ReviewUser(Guid id)
    {
        var model = await _adminService.GetUserReviewAsync(id);
        return model == null ? NotFound() : View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ReviewUserKyc(Guid id, bool approve, string? reason)
    {
        if (!approve && string.IsNullOrWhiteSpace(reason))
        {
            TempData["ErrorMessage"] = "اكتب سبب رفض التوثيق ليتمكن المستخدم من تصحيح بياناته.";
            return RedirectToAction(nameof(ReviewUser), new { id });
        }

        var updated = approve
            ? await _adminService.ApproveUserAsync(id)
            : await _adminService.RejectUserAsync(id, reason!.Trim());
        TempData[updated ? "SuccessMessage" : "ErrorMessage"] = updated
            ? approve ? "تم اعتماد التوثيق وتفعيل الحساب." : "تم رفض التوثيق وحفظ سبب الرفض."
            : "تعذر تحديث حالة التوثيق؛ تأكد من وجود المستخدم.";
        return RedirectToAction(nameof(ReviewUser), new { id });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> VerifyUserPhysicalPapers(Guid breederId)
    {
        var verified = await _adminService.VerifyPhysicalPapersAsync(breederId);
        TempData[verified ? "SuccessMessage" : "ErrorMessage"] = verified
            ? "تم اعتماد الأوراق الورقية للمربي."
            : "تعذر اعتماد الأوراق؛ تأكد من وجود ملف المربي.";
        return RedirectToAction(nameof(ReviewUser), new { id = breederId });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddAnimal(AnimalViewModel model)
    {
        if (!ModelState.IsValid || model.DefaultTargetWeight <= model.DefaultInitialWeight)
        {
            TempData["ErrorMessage"] = ModelState.IsValid
                ? "الوزن المستهدف الافتراضي يجب أن يكون أكبر من الوزن الابتدائي."
                : string.Join(" ", ModelState.Values.SelectMany(value => value.Errors).Select(error => error.ErrorMessage));
            return RedirectToAction("Dashboard", new { tab = "animals" });
        }

        var added = await _adminService.AddAnimalAsync(new Dawab.Application.DTOs.Cycles.AnimalDto
        {
            Name = model.Name,
            DefaultInitialWeight = model.DefaultInitialWeight,
            DefaultTargetWeight = model.DefaultTargetWeight,
            DefaultPricePerHead = model.DefaultPricePerHead,
            DefaultBarnInsuranceCost = model.DefaultBarnInsuranceCost,
            DefaultDurationDays = model.DefaultDurationDays
        });
        TempData[added ? "SuccessMessage" : "ErrorMessage"] = added
            ? "تمت إضافة نوع الحيوان إلى قائمة الدورات."
            : "تعذرت الإضافة؛ قد يكون الاسم مستخدماً أو أن بيانات الأوزان غير صحيحة.";
        return RedirectToAction("Dashboard", new { tab = "animals" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateAnimal(Guid id, AnimalViewModel model)
    {
        if (!ModelState.IsValid || model.DefaultTargetWeight <= model.DefaultInitialWeight)
        {
            TempData["ErrorMessage"] = ModelState.IsValid
                ? "الوزن المستهدف الافتراضي يجب أن يكون أكبر من الوزن الابتدائي."
                : string.Join(" ", ModelState.Values.SelectMany(value => value.Errors).Select(error => error.ErrorMessage));
            return RedirectToAction("Dashboard", new { tab = "animals" });
        }

        var updated = await _adminService.UpdateAnimalAsync(new Dawab.Application.DTOs.Cycles.AnimalDto
        {
            Id = id,
            Name = model.Name,
            DefaultInitialWeight = model.DefaultInitialWeight,
            DefaultTargetWeight = model.DefaultTargetWeight,
            DefaultPricePerHead = model.DefaultPricePerHead,
            DefaultBarnInsuranceCost = model.DefaultBarnInsuranceCost,
            DefaultDurationDays = model.DefaultDurationDays
        });
        TempData[updated ? "SuccessMessage" : "ErrorMessage"] = updated
            ? "تم تحديث نوع الحيوان والقيم الافتراضية."
            : "تعذر التحديث؛ تحقق من الاسم والقيم أو تأكد أن النوع ما زال موجوداً.";
        return RedirectToAction("Dashboard", new { tab = "animals" });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SetAnimalActive(Guid id, bool isActive)
    {
        var updated = await _adminService.SetAnimalActiveAsync(id, isActive);
        TempData[updated ? "SuccessMessage" : "ErrorMessage"] = updated
            ? isActive ? "تم تفعيل نوع الحيوان." : "تم إيقاف نوع الحيوان عن الظهور للمربين."
            : "تعذر تحديث نوع الحيوان.";
        return RedirectToAction("Dashboard", new { tab = "animals" });
    }

    [HttpPost]
    public async Task<IActionResult> ApproveUser(Guid id, string tab = "overview")
    {
        await _adminService.ApproveUserAsync(id);
        TempData["SuccessMessage"] = "تم تفعيل حساب المستخدم بنجاح.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> RejectUser(Guid id, string? reason, string tab = "overview")
    {
        await _adminService.RejectUserAsync(id, reason);
        TempData["SuccessMessage"] = "تم رفض حساب المستخدم.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> VerifyPhysicalPapers(Guid breederId, string tab = "overview")
    {
        await _adminService.VerifyPhysicalPapersAsync(breederId);
        TempData["SuccessMessage"] = "تم تأكيد وصول الأوراق المادية والفيش الجنائي وتوثيق المربي بنجاح.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> ApproveCycle(Guid id, string tab = "overview")
    {
        var adminId = GetCurrentAdminId();
        var approved = await _adminService.ApproveCycleAsync(id, adminId);
        TempData[approved ? "SuccessMessage" : "ErrorMessage"] = approved
            ? "تم اعتماد الدورة وفتحها للتمويل."
            : "تعذر اعتماد الدورة؛ تحقق من حالتها الحالية.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> RejectCycle(Guid id, string? reason, string tab = "overview")
    {
        var rejected = await _adminService.RejectCycleAsync(id, GetCurrentAdminId(), reason);
        TempData[rejected ? "SuccessMessage" : "ErrorMessage"] = rejected
            ? "تم رفض الدورة وإبلاغ المربي بالحالة من خلال لوحة التحكم."
            : "تعذر رفض الدورة؛ قد لا تكون في انتظار المراجعة.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> StartProduction(Guid id, string tab = "overview")
    {
        var started = await _adminService.StartProductionAsync(id);
        TempData[started ? "SuccessMessage" : "ErrorMessage"] = started
            ? "اكتمل التمويل وتم بدء مرحلة الإنتاج."
            : "لا يمكن بدء الإنتاج قبل اكتمال التمويل ومراجعة جميع طلبات الاستثمار.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> ApproveInvestment(Guid id, string tab = "overview")
    {
        var adminId = GetCurrentAdminId();
        var approved = await _adminService.ApproveInvestmentAsync(id, adminId);
        TempData[approved ? "SuccessMessage" : "ErrorMessage"] = approved
            ? "تم تأكيد التحويل البنكي وتحديث تمويل الدورة وتوليد كود العقد الموحد."
            : "تعذر اعتماد الطلب؛ قد تكون الدورة أغلقت للتمويل أو تجاوز المبلغ المتبقي.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    public async Task<IActionResult> RejectInvestment(Guid id, string? reason, string tab = "overview")
    {
        var adminId = GetCurrentAdminId();
        var rejected = await _adminService.RejectInvestmentAsync(id, adminId, reason);
        TempData[rejected ? "SuccessMessage" : "ErrorMessage"] = rejected
            ? "تم رفض طلب الاستثمار."
            : "تعذر رفض الطلب؛ تحقق من حالته الحالية.";
        return RedirectToDashboardTab(tab);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> MarkPayoutTransferred(Guid id, string transferReference, string tab = "overview")
    {
        var marked = await _adminService.MarkPayoutTransferredAsync(id, transferReference);
        TempData[marked ? "SuccessMessage" : "ErrorMessage"] = marked
            ? "تم تسجيل تحويل مستحق المستثمر."
            : "تعذر تسجيل التحويل؛ راجع رقم التحويل وتأكد أن المستحق لم يُسجل محولاً مسبقاً.";
        return RedirectToDashboardTab(tab);
    }

    // HTMX: Settle Cycle Modal
    [HttpGet]
    public async Task<IActionResult> SettleModal(Guid cycleId)
    {
        var cycle = await _cycleService.GetCycleByIdAsync(cycleId);
        if (cycle == null) return NotFound();

        var model = new SettleCycleViewModel
        {
            CycleId = cycle.Id,
            AnimalType = cycle.AnimalType,
            FundingGoal = cycle.CurrentFunding,
            FinalSalePrice = 0m
        };

        return PartialView("_SettleModalPartial", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SettleCycle(SettleCycleViewModel model, string tab = "overview")
    {
        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = string.Join(" ", ModelState.Values.SelectMany(value => value.Errors).Select(error => error.ErrorMessage));
            return RedirectToDashboardTab(tab);
        }

        try
        {
            await _adminService.SettleCycleAsync(GetCurrentAdminId(), new SettleCycleDto
            {
                CycleId = model.CycleId,
                FinalSalePrice = model.FinalSalePrice,
                Notes = model.Notes
            });
            TempData["SuccessMessage"] = "تم إنهاء الدورة وإنشاء مستحقات المستثمرين. سجّل الإدارة مرجع التحويل بعد إتمامه فعلياً.";
        }
        catch (InvalidOperationException exception)
        {
            TempData["ErrorMessage"] = exception.Message;
        }

        return RedirectToDashboardTab(tab);
    }

    private IActionResult RedirectToDashboardTab(string? tab)
    {
        var validTabs = new[] { "overview", "users", "cycles", "animals", "monitoring", "investments", "payouts", "insurance" };
        var selectedTab = validTabs.Contains(tab, StringComparer.Ordinal) ? tab : "overview";
        return RedirectToAction(nameof(Dashboard), new { tab = selectedTab });
    }

    private Guid GetCurrentAdminId()
    {
        return Guid.Parse(HttpContext.Session.GetString("UserId")!);
    }
}
