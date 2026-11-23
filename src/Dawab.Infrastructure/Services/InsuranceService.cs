using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Insurance;
using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class InsuranceService : IInsuranceService
{
    private readonly IApplicationDbContext _context;

    public InsuranceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<InsuranceFundSummaryDto> GetFundSummaryAsync()
    {
        var policies = await _context.InsurancePolicies.AsNoTracking().ToListAsync();
        var claims = await _context.InsuranceClaims.AsNoTracking().ToListAsync();

        var animalPolicies = policies.Where(p => p.PolicyType == PolicyType.AnimalLifeInsurance).ToList();
        var barnPolicies = policies.Where(p => p.PolicyType == PolicyType.BarnInsurance).ToList();

        var totalAnimal = animalPolicies.Sum(p => p.PremiumAmount);
        var totalBarn = barnPolicies.Sum(p => p.PremiumAmount);
        var totalClaimsPaid = claims.Where(c => c.Status == ClaimStatus.Approved).Sum(c => c.ApprovedAmount);

        return new InsuranceFundSummaryDto
        {
            TotalFundBalance = (totalAnimal + totalBarn) - totalClaimsPaid,
            TotalAnimalLifeInsuranceCollected = totalAnimal,
            AnimalPoliciesCount = animalPolicies.Count,
            TotalBarnInsuranceCollected = totalBarn,
            BarnPoliciesCount = barnPolicies.Count,
            TotalClaimsPaid = totalClaimsPaid,
            ActiveClaimsCount = claims.Count(c => c.Status == ClaimStatus.Pending)
        };
    }

    public async Task<InsuranceClaimDto> FileClaimAsync(Guid claimantId, CreateClaimDto dto)
    {
        var policy = await _context.InsurancePolicies.FirstOrDefaultAsync(p => p.Id == dto.PolicyId);
        if (policy == null)
        {
            throw new InvalidOperationException("وثيقة التأمين غير موجودة.");
        }

        var claim = new InsuranceClaim
        {
            PolicyId = dto.PolicyId,
            ClaimantId = claimantId,
            IncidentDate = dto.IncidentDate,
            IncidentType = dto.IncidentType,
            Description = dto.Description,
            ClaimAmount = dto.ClaimAmount,
            VetInspectionReportUrl = dto.VetInspectionReportUrl,
            Status = ClaimStatus.Pending
        };

        _context.InsuranceClaims.Add(claim);
        await _context.SaveChangesAsync();

        return new InsuranceClaimDto
        {
            Id = claim.Id,
            PolicyId = claim.PolicyId,
            PolicyNumber = policy.PolicyNumber,
            ClaimantId = claimantId,
            IncidentDate = claim.IncidentDate,
            IncidentType = claim.IncidentType,
            Description = claim.Description,
            ClaimAmount = claim.ClaimAmount,
            ApprovedAmount = claim.ApprovedAmount,
            Status = claim.Status
        };
    }

    public async Task<bool> ReviewClaimAsync(Guid claimId, Guid adminId, bool approve, decimal approvedAmount, string? notes)
    {
        var claim = await _context.InsuranceClaims.FirstOrDefaultAsync(c => c.Id == claimId);
        if (claim == null) return false;

        claim.Status = approve ? ClaimStatus.Approved : ClaimStatus.Rejected;
        claim.ApprovedAmount = approve ? approvedAmount : 0;
        claim.ResolutionNotes = notes;
        claim.ResolvedBy = adminId;
        claim.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<InsuranceClaimDto>> GetAllClaimsAsync()
    {
        var claims = await _context.InsuranceClaims
            .Include(c => c.Policy)
            .Include(c => c.Claimant)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return claims.Select(c => new InsuranceClaimDto
        {
            Id = c.Id,
            PolicyId = c.PolicyId,
            PolicyNumber = c.Policy?.PolicyNumber ?? string.Empty,
            ClaimantId = c.ClaimantId,
            ClaimantName = c.Claimant?.Name ?? "غير محدد",
            IncidentDate = c.IncidentDate,
            IncidentType = c.IncidentType,
            Description = c.Description,
            ClaimAmount = c.ClaimAmount,
            ApprovedAmount = c.ApprovedAmount,
            Status = c.Status
        }).ToList();
    }
}
