using Dawab.Application.DTOs.Insurance;

namespace Dawab.Application.Common.Interfaces;

public interface IInsuranceService
{
    Task<InsuranceFundSummaryDto> GetFundSummaryAsync();
    Task<InsuranceClaimDto> FileClaimAsync(Guid claimantId, CreateClaimDto dto);
    Task<bool> ReviewClaimAsync(Guid claimId, Guid adminId, bool approve, decimal approvedAmount, string? notes);
    Task<List<InsuranceClaimDto>> GetAllClaimsAsync();
}
