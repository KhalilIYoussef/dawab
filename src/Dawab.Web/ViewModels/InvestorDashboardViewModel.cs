using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Investments;
using Dawab.Domain.Enums;

namespace Dawab.Web.ViewModels;

public class InvestorDashboardViewModel
{
    public UserStatus AccountStatus { get; set; }
    public List<CycleDto> AvailableCycles { get; set; } = new();
    public List<InvestmentDto> Investments { get; set; } = new();

    public decimal ApprovedInvestmentTotal => Investments
        .Where(investment => investment.Status == InvestmentStatus.Approved)
        .Sum(investment => investment.Amount);

    public int ApprovedInvestmentsCount => Investments
        .Count(investment => investment.Status == InvestmentStatus.Approved);

    public int PendingInvestmentsCount => Investments
        .Count(investment => investment.Status == InvestmentStatus.PendingApproval);
}
