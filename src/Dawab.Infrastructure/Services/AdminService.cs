using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Dashboard;
using Dawab.Application.DTOs.Settlements;
using Dawab.Application.DTOs.Users;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IApplicationDbContext _context;
    private readonly ICycleService _cycleService;
    private readonly IInvestmentService _investmentService;
    private readonly IInsuranceService _insuranceService;
    private readonly ISettlementService _settlementService;
    private readonly IAuthService _authService;

    public AdminService(
        IApplicationDbContext context,
        ICycleService cycleService,
        IInvestmentService investmentService,
        IInsuranceService insuranceService,
        ISettlementService settlementService,
        IAuthService authService)
    {
        _context = context;
        _cycleService = cycleService;
        _investmentService = investmentService;
        _insuranceService = insuranceService;
        _settlementService = settlementService;
        _authService = authService;
    }

    public async Task<AdminDashboardDto> GetDashboardDataAsync()
    {
        var users = await _context.Users
            .Include(u => u.BreederProfile)
            .Include(u => u.KycDocument)
            .OrderByDescending(u => u.CreatedAt)
            .AsNoTracking()
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Phone = u.Phone,
                Role = u.Role,
                Status = u.Status,
                ProfilePictureUrl = u.ProfilePictureUrl,
                FarmName = u.BreederProfile != null ? u.BreederProfile.FarmName : null,
                Governorate = u.BreederProfile != null ? u.BreederProfile.Governorate : null,
                PhysicalPapersVerified = u.BreederProfile != null && u.BreederProfile.PhysicalPapersVerified,
                IsKycVerified = u.KycDocument != null && u.KycDocument.IsVerified,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        var cycles = await _cycleService.GetAllCyclesAsync();
        var investments = await _investmentService.GetAllInvestmentsAsync();
        var insuranceSummary = await _insuranceService.GetFundSummaryAsync();
        var claims = await _insuranceService.GetAllClaimsAsync();
        var animals = await _context.Animals
            .OrderBy(animal => animal.Name)
            .AsNoTracking()
            .Select(animal => new Dawab.Application.DTOs.Cycles.AnimalDto
            {
                Id = animal.Id,
                Name = animal.Name,
                DefaultInitialWeight = animal.DefaultInitialWeight,
                DefaultTargetWeight = animal.DefaultTargetWeight,
                DefaultPricePerHead = animal.DefaultPricePerHead,
                DefaultBarnInsuranceCost = animal.DefaultBarnInsuranceCost,
                DefaultDurationDays = animal.DefaultDurationDays,
                IsActive = animal.IsActive
            })
            .ToListAsync();
        var investorPayouts = await _context.SettlementInvestorPayouts
            .Include(payout => payout.Investor)
            .Include(payout => payout.Settlement)
                .ThenInclude(settlement => settlement.Cycle)
            .OrderByDescending(payout => payout.CreatedAt)
            .AsNoTracking()
            .Select(payout => new Dawab.Application.DTOs.Settlements.SettlementInvestorPayoutDto
            {
                Id = payout.Id,
                SettlementId = payout.SettlementId,
                InvestmentId = payout.InvestmentId,
                InvestorId = payout.InvestorId,
                InvestorName = payout.Investor.Name,
                CycleAnimalType = payout.Settlement.Cycle.AnimalType,
                CapitalReturned = payout.CapitalReturned,
                ProfitShare = payout.ProfitShare,
                TotalPayout = payout.TotalPayout,
                IsTransferred = payout.IsTransferred,
                TransferReference = payout.TransferReference,
                TransferredAt = payout.TransferredAt
            })
            .ToListAsync();

        return new AdminDashboardDto
        {
            Users = users,
            Animals = animals,
            Cycles = cycles,
            Investments = investments,
            InvestorPayouts = investorPayouts,
            InsuranceSummary = insuranceSummary,
            Claims = claims
        };
    }

    public async Task<AdminUserReviewDto?> GetUserReviewAsync(Guid userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new AdminUserReviewDto
            {
                Id = user.Id,
                Name = user.Name,
                Phone = user.Phone,
                Role = user.Role,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                ProfilePictureUrl = user.ProfilePictureUrl,
                HasKycDocument = user.KycDocument != null,
                NationalId = user.KycDocument != null ? user.KycDocument.NationalId : null,
                BankName = user.KycDocument != null ? user.KycDocument.BankName : null,
                Iban = user.KycDocument != null ? user.KycDocument.Iban : null,
                IdCardFrontUrl = user.KycDocument != null ? user.KycDocument.IdCardFrontUrl : null,
                IdCardBackUrl = user.KycDocument != null ? user.KycDocument.IdCardBackUrl : null,
                ContractUrl = user.KycDocument != null ? user.KycDocument.ContractUrl : null,
                IsKycVerified = user.KycDocument != null && user.KycDocument.IsVerified,
                RejectionReason = user.KycDocument != null ? user.KycDocument.RejectionReason : null,
                ReviewedAt = user.KycDocument != null ? user.KycDocument.ReviewedAt : null,
                FarmName = user.BreederProfile != null ? user.BreederProfile.FarmName : null,
                Governorate = user.BreederProfile != null ? user.BreederProfile.Governorate : null,
                Address = user.BreederProfile != null ? user.BreederProfile.Address : null,
                CriminalRecordUrl = user.BreederProfile != null ? user.BreederProfile.CriminalRecordUrl : null,
                PhysicalPapersSent = user.BreederProfile != null && user.BreederProfile.PhysicalPapersSent,
                PhysicalPapersVerified = user.BreederProfile != null && user.BreederProfile.PhysicalPapersVerified,
                PhysicalPapersVerifiedAt = user.BreederProfile != null ? user.BreederProfile.VerifiedAt : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> AddAnimalAsync(Dawab.Application.DTOs.Cycles.AnimalDto animal)
    {
        var name = animal.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)
            || animal.DefaultInitialWeight <= 0
            || animal.DefaultTargetWeight <= animal.DefaultInitialWeight
            || animal.DefaultPricePerHead <= 0
            || animal.DefaultBarnInsuranceCost < 0
            || animal.DefaultDurationDays is < 1 or > 3650)
        {
            return false;
        }

        var alreadyExists = await _context.Animals.AnyAsync(item => item.Name.ToLower() == name.ToLower());
        if (alreadyExists)
        {
            return false;
        }

        _context.Animals.Add(new Dawab.Domain.Entities.Animal
        {
            Name = name,
            DefaultInitialWeight = animal.DefaultInitialWeight,
            DefaultTargetWeight = animal.DefaultTargetWeight,
            DefaultPricePerHead = animal.DefaultPricePerHead,
            DefaultBarnInsuranceCost = animal.DefaultBarnInsuranceCost,
            DefaultDurationDays = animal.DefaultDurationDays,
            IsActive = true
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateAnimalAsync(Dawab.Application.DTOs.Cycles.AnimalDto animalDto)
    {
        var name = animalDto.Name.Trim();
        if (string.IsNullOrWhiteSpace(name)
            || animalDto.DefaultInitialWeight <= 0
            || animalDto.DefaultTargetWeight <= animalDto.DefaultInitialWeight
            || animalDto.DefaultPricePerHead <= 0
            || animalDto.DefaultBarnInsuranceCost < 0
            || animalDto.DefaultDurationDays is < 1 or > 3650)
        {
            return false;
        }

        var animal = await _context.Animals.FirstOrDefaultAsync(item => item.Id == animalDto.Id);
        if (animal == null || await _context.Animals.AnyAsync(item => item.Id != animalDto.Id && item.Name.ToLower() == name.ToLower()))
        {
            return false;
        }

        animal.Name = name;
        animal.DefaultInitialWeight = animalDto.DefaultInitialWeight;
        animal.DefaultTargetWeight = animalDto.DefaultTargetWeight;
        animal.DefaultPricePerHead = animalDto.DefaultPricePerHead;
        animal.DefaultBarnInsuranceCost = animalDto.DefaultBarnInsuranceCost;
        animal.DefaultDurationDays = animalDto.DefaultDurationDays;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetAnimalActiveAsync(Guid animalId, bool isActive)
    {
        var animal = await _context.Animals.FirstOrDefaultAsync(item => item.Id == animalId);
        if (animal == null)
        {
            return false;
        }

        animal.IsActive = isActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public Task<bool> ApproveUserAsync(Guid userId)
    {
        return _authService.VerifyUserKycAsync(userId, true);
    }

    public Task<bool> RejectUserAsync(Guid userId, string? reason)
    {
        return _authService.VerifyUserKycAsync(userId, false, reason);
    }

    public Task<bool> VerifyPhysicalPapersAsync(Guid breederId)
    {
        return _authService.VerifyBreederPhysicalPapersAsync(breederId, true);
    }

    public Task<bool> ApproveCycleAsync(Guid cycleId, Guid adminId)
    {
        return _cycleService.ApproveCycleAsync(cycleId, adminId);
    }

    public Task<bool> RejectCycleAsync(Guid cycleId, Guid adminId, string? reason)
    {
        return _cycleService.RejectCycleAsync(cycleId, adminId, reason);
    }

    public Task<bool> StartProductionAsync(Guid cycleId)
    {
        return _cycleService.StartProductionAsync(cycleId);
    }

    public Task<bool> ApproveInvestmentAsync(Guid investmentId, Guid adminId)
    {
        return _investmentService.ApproveInvestmentAsync(investmentId, adminId);
    }

    public Task<bool> RejectInvestmentAsync(Guid investmentId, Guid adminId, string? reason)
    {
        return _investmentService.RejectInvestmentAsync(investmentId, adminId, reason);
    }

    public async Task<bool> SettleCycleAsync(Guid adminId, SettleCycleDto dto)
    {
        var result = await _settlementService.SettleCycleAsync(adminId, dto);
        return result != null;
    }

    public Task<bool> MarkPayoutTransferredAsync(Guid payoutId, string transferReference)
    {
        return _settlementService.MarkPayoutTransferredAsync(payoutId, transferReference);
    }
}
