using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Insurance;

namespace Dawab.Web.ViewModels;

public class HomeIndexViewModel
{
    public List<CycleDto> FeaturedCycles { get; set; } = new();
    public int TotalCyclesCount { get; set; }
    public int ActiveBreederCount { get; set; }
    public decimal TotalInvestedAmount { get; set; }
    public InsuranceFundSummaryDto InsuranceSummary { get; set; } = new();
}
