using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Insurance;
using Dawab.Application.DTOs.Investments;
using Dawab.Domain.Entities;

namespace Dawab.Web.ViewModels;

public class AdminDashboardViewModel
{
    public List<User> Users { get; set; } = new();
    public List<CycleDto> Cycles { get; set; } = new();
    public List<InvestmentDto> Investments { get; set; } = new();
    public InsuranceFundSummaryDto InsuranceSummary { get; set; } = new();
    public List<InsuranceClaimDto> Claims { get; set; } = new();
}
