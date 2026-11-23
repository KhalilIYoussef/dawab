using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Insurance;
using Dawab.Application.DTOs.Investments;
using Dawab.Application.DTOs.Settlements;
using Dawab.Application.DTOs.Users;

namespace Dawab.Application.DTOs.Dashboard;

public class AdminDashboardDto
{
    public List<UserDto> Users { get; set; } = new();
    public List<AnimalDto> Animals { get; set; } = new();
    public List<CycleDto> Cycles { get; set; } = new();
    public List<InvestmentDto> Investments { get; set; } = new();
    public List<SettlementInvestorPayoutDto> InvestorPayouts { get; set; } = new();
    public InsuranceFundSummaryDto InsuranceSummary { get; set; } = new();
    public List<InsuranceClaimDto> Claims { get; set; } = new();
}
