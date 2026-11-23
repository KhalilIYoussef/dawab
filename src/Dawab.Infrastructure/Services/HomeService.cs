using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Dashboard;
using Dawab.Domain.Enums;

namespace Dawab.Infrastructure.Services;

public class HomeService : IHomeService
{
    private readonly ICycleService _cycleService;
    private readonly IInsuranceService _insuranceService;
    private readonly IInvestmentService _investmentService;

    public HomeService(
        ICycleService cycleService,
        IInsuranceService insuranceService,
        IInvestmentService investmentService)
    {
        _cycleService = cycleService;
        _insuranceService = insuranceService;
        _investmentService = investmentService;
    }

    public async Task<HomeDashboardDto> GetHomeDataAsync()
    {
        var allCycles = await _cycleService.GetAllCyclesAsync();
        var featuredCycles = allCycles
            .Where(c => c.Status == CycleStatus.Funding && c.RemainingFunding > 0)
            .Take(3)
            .ToList();

        var investments = await _investmentService.GetAllInvestmentsAsync();
        var insuranceSummary = await _insuranceService.GetFundSummaryAsync();

        return new HomeDashboardDto
        {
            FeaturedCycles = featuredCycles,
            TotalCyclesCount = allCycles.Count,
            ActiveBreederCount = allCycles
                .Where(c => c.Status == CycleStatus.Active)
                .Select(c => c.BreederId)
                .Distinct()
                .Count(),
            TotalInvestedAmount = investments.Where(i => i.Status == InvestmentStatus.Approved).Sum(i => i.Amount),
            InsuranceSummary = insuranceSummary
        };
    }
}
