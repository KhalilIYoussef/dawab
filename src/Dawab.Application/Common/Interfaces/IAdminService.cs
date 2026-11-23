using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Dashboard;
using Dawab.Application.DTOs.Settlements;
using Dawab.Application.DTOs.Users;

namespace Dawab.Application.Common.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardDataAsync();
    Task<AdminUserReviewDto?> GetUserReviewAsync(Guid userId);
    Task<bool> AddAnimalAsync(AnimalDto animal);
    Task<bool> UpdateAnimalAsync(AnimalDto animal);
    Task<bool> SetAnimalActiveAsync(Guid animalId, bool isActive);
    Task<bool> ApproveUserAsync(Guid userId);
    Task<bool> RejectUserAsync(Guid userId, string? reason);
    Task<bool> VerifyPhysicalPapersAsync(Guid breederId);
    Task<bool> ApproveCycleAsync(Guid cycleId, Guid adminId);
    Task<bool> RejectCycleAsync(Guid cycleId, Guid adminId, string? reason);
    Task<bool> StartProductionAsync(Guid cycleId);
    Task<bool> ApproveInvestmentAsync(Guid investmentId, Guid adminId);
    Task<bool> RejectInvestmentAsync(Guid investmentId, Guid adminId, string? reason);
    Task<bool> SettleCycleAsync(Guid adminId, SettleCycleDto dto);
    Task<bool> MarkPayoutTransferredAsync(Guid payoutId, string transferReference);
}
