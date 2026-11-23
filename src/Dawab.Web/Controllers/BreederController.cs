using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Logs;
using Dawab.Domain.Enums;
using Dawab.Web.Filters;
using Dawab.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dawab.Web.Controllers;

[RequireRole(UserRole.Breeder)]
public class BreederController : Controller
{
    private readonly IBreederService _breederService;
    private readonly ICycleService _cycleService;

    public BreederController(IBreederService breederService, ICycleService cycleService)
    {
        _breederService = breederService;
        _cycleService = cycleService;
    }

    [HttpGet]
    public async Task<IActionResult> Dashboard()
    {
        var breederId = GetCurrentBreederId();
        var model = await _breederService.GetDashboardDataAsync(breederId);
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> ActiveCycles()
    {
        var model = await _breederService.GetDashboardDataAsync(GetCurrentBreederId());
        model.Cycles = model.Cycles
            .Where(cycle => cycle.Status == CycleStatus.Active)
            .ToList();

        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> CreateCycle()
    {
        var model = new CreateCycleViewModel
        {
            Animals = await _cycleService.GetAvailableAnimalsAsync()
        };
        if (model.Animals.Count == 0)
        {
            TempData["ErrorMessage"] = "لا توجد أنواع حيوانات متاحة حالياً. يرجى التواصل مع الإدارة.";
            return RedirectToAction("Dashboard");
        }

        model.AnimalId = model.Animals[0].Id;
        model.InitialWeight = model.Animals[0].DefaultInitialWeight;
        model.TargetWeight = model.Animals[0].DefaultTargetWeight;
        model.StartPricePerHead = model.Animals[0].DefaultPricePerHead;
        model.ExpectedDurationDays = model.Animals[0].DefaultDurationDays;
        model.Stages = new List<FatteningStageDto> { new() };
        model.VaccineNames = new List<string> { string.Empty };
        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateCycle(CreateCycleViewModel model, IFormFile? imageFile)
    {
        var breederId = GetCurrentBreederId();
        model.Animals = await _cycleService.GetAvailableAnimalsAsync();
        if (model.Animals.Count == 0)
        {
            TempData["ErrorMessage"] = "لا توجد أنواع حيوانات متاحة حالياً. يرجى التواصل مع الإدارة.";
            return RedirectToAction("Dashboard");
        }

        model.Stages ??= new List<FatteningStageDto>();
        model.VaccineNames ??= new List<string>();
        if (!model.Animals.Any(animal => animal.Id == model.AnimalId))
        {
            ModelState.AddModelError(nameof(model.AnimalId), "نوع الحيوان لم يعد متاحاً. اختر نوعاً نشطاً من القائمة.");
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var dto = new CreateCycleDto
        {
            AnimalId = model.AnimalId,
            InitialWeight = model.InitialWeight,
            TargetWeight = model.TargetWeight,
            TotalHeads = model.TotalHeads,
            StartPricePerHead = model.StartPricePerHead,
            FundingGoal = model.StartPricePerHead * model.TotalHeads,
            ExpectedDurationDays = model.ExpectedDurationDays,
            Description = model.Description,
            IsBarnInsured = model.IsBarnInsured,
            Stages = model.Stages.Where(stage => !string.IsNullOrWhiteSpace(stage.StageName)).Select((stage, index) =>
            {
                stage.StageOrder = index + 1;
                return stage;
            }).ToList(),
            VaccineNames = model.VaccineNames.Where(vaccine => !string.IsNullOrWhiteSpace(vaccine)).ToList()
        };

        if (imageFile is { Length: > 0 })
        {
            await using var stream = imageFile.OpenReadStream();
            await _breederService.CreateCycleAsync(breederId, dto, stream, imageFile.FileName);
        }
        else
        {
            await _breederService.CreateCycleAsync(breederId, dto, null, null);
        }
        TempData["SuccessMessage"] = "تم إضافة دورة التسمين الجديدة بنجاح! سيتم مراجعتها واعتمادها من الإدارة لطرحها للمستثمرين.";
        return RedirectToAction("Dashboard");
    }

    // HTMX: Open Add Log Modal
    [HttpGet]
    public async Task<IActionResult> AddLogModal(Guid cycleId)
    {
        var cycles = await _cycleService.GetBreederCyclesAsync(GetCurrentBreederId());
        if (!cycles.Any(cycle => cycle.Id == cycleId))
        {
            return NotFound();
        }

        var model = new AddDailyLogViewModel { CycleId = cycleId };
        return PartialView("_AddLogModalPartial", model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SubmitLog(AddDailyLogViewModel model)
    {
        var dto = new CreateCycleLogDto
        {
            CycleId = model.CycleId,
            CurrentWeight = model.CurrentWeight,
            WaterLiters = model.WaterLiters,
            Notes = model.GeneralNotes,
            FoodSummary = $"علف مركز: {model.FeedConcentrateKg} كجم، مواد خشنة: {model.RoughageKg} كجم"
        };

        if (model.FeedConcentrateKg > 0)
            dto.FeedItems.Add(new FeedItemDto { Category = FeedCategory.Energy, ItemName = "علف مركز", Quantity = model.FeedConcentrateKg, Unit = "كجم" });
        if (model.RoughageKg > 0)
            dto.FeedItems.Add(new FeedItemDto { Category = FeedCategory.Roughage, ItemName = "مواد خشنة (سيلاج/تبن)", Quantity = model.RoughageKg, Unit = "كجم" });

        if (!string.IsNullOrEmpty(model.VaccineApplied))
            dto.VetRecords.Add(new VetRecordDto { RecordType = VetRecordType.Vaccine, Title = model.VaccineApplied });
        if (!string.IsNullOrEmpty(model.TreatmentApplied))
            dto.VetRecords.Add(new VetRecordDto { RecordType = VetRecordType.Treatment, Title = model.TreatmentApplied });

        await _breederService.AddDailyLogAsync(GetCurrentBreederId(), dto);
        TempData["SuccessMessage"] = "تم تسجيل التقرير اليومي بنجاح!";
        return RedirectToAction("Dashboard");
    }

    private Guid GetCurrentBreederId()
    {
        return Guid.Parse(HttpContext.Session.GetString("UserId")!);
    }
}
