using Dawab.Application.DTOs.Investments;

namespace Dawab.Application.Common.Interfaces;

public interface IInvestmentService
{
    Task<FeeCalculationDto> CalculateFeesAsync(decimal amount, bool hasInsurance);
    Task<InvestmentDto> CreateInvestmentAsync(Guid investorId, CreateInvestmentDto dto);
    Task<bool> ApproveInvestmentAsync(Guid investmentId, Guid adminId);
    Task<bool> RejectInvestmentAsync(Guid investmentId, Guid adminId, string? reason);
    Task<List<InvestmentDto>> GetInvestorPortfolioAsync(Guid investorId);
    Task<List<InvestmentDto>> GetAllInvestmentsAsync();
}
