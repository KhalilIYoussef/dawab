using Dawab.Application.Common.Interfaces;
using Dawab.Domain.Enums;
using Dawab.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Dawab.Web.Controllers;

public class CyclesController : Controller
{
    private readonly ICycleService _cycleService;
    private readonly IMonitoringService _monitoringService;
    private readonly IAiRiskService _aiRiskService;

    public CyclesController(
        ICycleService cycleService,
        IMonitoringService monitoringService,
        IAiRiskService aiRiskService)
    {
        _cycleService = cycleService;
        _monitoringService = monitoringService;
        _aiRiskService = aiRiskService;
    }

    public async Task<IActionResult> Index(string? search)
    {
        var cycles = await _cycleService.GetAllCyclesAsync(CycleStatus.Funding);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            cycles = cycles.Where(c => c.AnimalType.ToLower().Contains(s) || c.Description.ToLower().Contains(s) || c.BreederName.ToLower().Contains(s)).ToList();
        }

        var viewModel = new CyclesListViewModel
        {
            Cycles = cycles,
            SearchTerm = search
        };

        return View(viewModel);
    }

    public async Task<IActionResult> Details(Guid id)
    {
        var cycle = await _cycleService.GetCycleByIdAsync(id);
        if (cycle == null || !CanViewCycle(cycle))
        {
            return NotFound();
        }

        var logs = await _monitoringService.GetCycleTimelineAsync(id);

        var viewModel = new CycleDetailsViewModel
        {
            Cycle = cycle,
            Logs = logs
        };

        return View(viewModel);
    }

    // HTMX Endpoint: Returns AI Risk Analysis
    [HttpGet]
    public async Task<IActionResult> RiskAnalysis(Guid id)
    {
        var cycle = await _cycleService.GetCycleByIdAsync(id);
        if (cycle == null || !CanViewCycle(cycle))
        {
            return NotFound();
        }

        var report = await _aiRiskService.AnalyzeCycleRiskAsync(id);
        return PartialView("_RiskAnalysisPartial", report);
    }

    private bool CanViewCycle(Dawab.Application.DTOs.Cycles.CycleDto cycle)
    {
        if (cycle.Status is not (CycleStatus.Pending or CycleStatus.Rejected or CycleStatus.Cancelled))
        {
            return true;
        }

        var currentRole = HttpContext.Session.GetString("UserRole");
        var isBreederOwner = currentRole == UserRole.Breeder.ToString()
            && Guid.TryParse(HttpContext.Session.GetString("UserId"), out var currentUserId)
            && cycle.BreederId == currentUserId;

        return currentRole == UserRole.Admin.ToString() || isBreederOwner;
    }
}
