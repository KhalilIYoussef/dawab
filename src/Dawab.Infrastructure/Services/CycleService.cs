using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Cycles;
using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class CycleService : ICycleService
{
    private readonly IApplicationDbContext _context;

    public CycleService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnimalDto>> GetAvailableAnimalsAsync()
    {
        return await _context.Animals
            .Where(animal => animal.IsActive)
            .OrderBy(animal => animal.Name)
            .AsNoTracking()
            .Select(animal => new AnimalDto
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
    }

    public async Task<List<CycleDto>> GetAllCyclesAsync(CycleStatus? status = null)
    {
        var query = _context.Cycles
            .Include(c => c.Breeder)
                .ThenInclude(b => b.BreederProfile)
            .Include(c => c.FatteningStages)
            .Include(c => c.VaccinePlans)
            .Include(c => c.Settlement)
            .AsNoTracking();

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        var cycles = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

        return cycles.Select(MapToDto).ToList();
    }

    public async Task<List<CycleDto>> GetBreederCyclesAsync(Guid breederId)
    {
        var cycles = await _context.Cycles
            .Include(c => c.Breeder)
                .ThenInclude(b => b.BreederProfile)
            .Include(c => c.FatteningStages)
            .Include(c => c.VaccinePlans)
            .Include(c => c.Settlement)
            .Where(c => c.BreederId == breederId)
            .OrderByDescending(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return cycles.Select(MapToDto).ToList();
    }

    public async Task<CycleDto?> GetCycleByIdAsync(Guid id)
    {
        var cycle = await _context.Cycles
            .Include(c => c.Breeder)
                .ThenInclude(b => b.BreederProfile)
            .Include(c => c.FatteningStages)
            .Include(c => c.VaccinePlans)
            .Include(c => c.Settlement)
            .FirstOrDefaultAsync(c => c.Id == id);

        return cycle == null ? null : MapToDto(cycle);
    }

    public async Task<CycleDto> CreateCycleAsync(Guid breederId, CreateCycleDto dto)
    {
        if (dto.AnimalId == Guid.Empty
            || dto.TotalHeads <= 0
            || dto.InitialWeight <= 0
            || dto.TargetWeight <= dto.InitialWeight
            || dto.StartPricePerHead <= 0
            || dto.ExpectedDurationDays <= 0)
        {
            throw new InvalidOperationException("بيانات الدورة غير مكتملة أو غير صحيحة.");
        }

        var breederExists = await _context.Users.AnyAsync(user => user.Id == breederId && user.Role == UserRole.Breeder);
        if (!breederExists)
        {
            throw new InvalidOperationException("حساب المربي غير موجود.");
        }

        var animal = await _context.Animals.FirstOrDefaultAsync(item => item.Id == dto.AnimalId && item.IsActive);
        if (animal == null)
        {
            throw new InvalidOperationException("نوع الحيوان غير متاح؛ اختر نوعاً آخر من القائمة.");
        }

        var barnCost = dto.IsBarnInsured ? animal.DefaultBarnInsuranceCost : 0m;

        var cycle = new Cycle
        {
            BreederId = breederId,
            AnimalId = animal.Id,
            AnimalType = animal.Name,
            InitialWeight = dto.InitialWeight,
            TargetWeight = dto.TargetWeight,
            TotalHeads = dto.TotalHeads,
            AvailableHeads = dto.TotalHeads,
            StartPricePerHead = dto.StartPricePerHead,
            FundingGoal = dto.StartPricePerHead * dto.TotalHeads,
            CurrentFunding = 0,
            ExpectedDurationDays = dto.ExpectedDurationDays,
            Description = dto.Description,
            ImageUrl = !string.IsNullOrEmpty(dto.ImageUrl) ? dto.ImageUrl : "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80",
            Status = CycleStatus.Pending,
            IsBarnInsured = dto.IsBarnInsured,
            BarnInsuranceCost = barnCost,
            InsurancePolicyNumber = dto.IsBarnInsured ? $"POL-BARN-{new Random().Next(100, 999)}" : null
        };

        if (dto.Stages.Any())
        {
            foreach (var s in dto.Stages)
            {
                cycle.FatteningStages.Add(new FatteningStage
                {
                    StageOrder = s.StageOrder,
                    StageName = s.StageName,
                    FeedConcentrateKg = s.FeedConcentrateKg,
                    RoughageKg = s.RoughageKg,
                    Notes = s.Notes
                });
            }
        }

        if (dto.VaccineNames.Any())
        {
            foreach (var v in dto.VaccineNames)
            {
                cycle.VaccinePlans.Add(new CycleVaccinePlan
                {
                    VaccineName = v,
                    IsMandatory = true
                });
            }
        }

        _context.Cycles.Add(cycle);

        if (cycle.IsBarnInsured)
        {
            _context.InsurancePolicies.Add(new InsurancePolicy
            {
                PolicyNumber = cycle.InsurancePolicyNumber ?? $"POL-{Guid.NewGuid():N}",
                PolicyType = PolicyType.BarnInsurance,
                CycleId = cycle.Id,
                PremiumAmount = barnCost,
                CoverageDetails = "تأمين حظيرة معتمد للدورة الإنتاجية ضد الكوارث والأخطار المحددة",
                Status = PolicyStatus.Active
            });
        }

        await _context.SaveChangesAsync();

        return MapToDto(cycle);
    }

    public async Task<bool> ApproveCycleAsync(Guid cycleId, Guid adminId)
    {
        var cycle = await _context.Cycles.FirstOrDefaultAsync(c => c.Id == cycleId);
        if (cycle == null || cycle.Status != CycleStatus.Pending) return false;

        cycle.Status = CycleStatus.Funding;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> StartProductionAsync(Guid cycleId)
    {
        var cycle = await _context.Cycles.FirstOrDefaultAsync(c => c.Id == cycleId);
        if (cycle == null || cycle.Status != CycleStatus.Funding || cycle.CurrentFunding < cycle.FundingGoal)
        {
            return false;
        }

        var hasPendingInvestments = await _context.Investments.AnyAsync(investment =>
            investment.CycleId == cycleId && investment.Status == InvestmentStatus.PendingApproval);
        if (hasPendingInvestments)
        {
            return false;
        }

        cycle.Status = CycleStatus.Active;
        cycle.StartDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectCycleAsync(Guid cycleId, Guid adminId, string? reason)
    {
        var cycle = await _context.Cycles.FirstOrDefaultAsync(c => c.Id == cycleId);
        if (cycle == null || cycle.Status != CycleStatus.Pending) return false;

        cycle.Status = CycleStatus.Rejected;
        cycle.AdminNote = string.IsNullOrWhiteSpace(reason) ? "تم رفض الدورة بعد المراجعة الإدارية." : reason.Trim();
        await _context.SaveChangesAsync();
        return true;
    }

    private static CycleDto MapToDto(Cycle c)
    {
        return new CycleDto
        {
            Id = c.Id,
            BreederId = c.BreederId,
            AnimalId = c.AnimalId,
            BreederName = c.Breeder?.Name ?? "غير محدد",
            BreederRating = c.Breeder?.BreederProfile?.Rating ?? 0.0m,
            BreederGovernorate = c.Breeder?.BreederProfile?.Governorate,
            AnimalType = c.AnimalType,
            InitialWeight = c.InitialWeight,
            TargetWeight = c.TargetWeight,
            TotalHeads = c.TotalHeads,
            AvailableHeads = c.AvailableHeads,
            StartPricePerHead = c.StartPricePerHead,
            FundingGoal = c.FundingGoal,
            CurrentFunding = c.CurrentFunding,
            StartDate = c.StartDate,
            ExpectedDurationDays = c.ExpectedDurationDays,
            Status = c.Status,
            ImageUrl = c.ImageUrl,
            Description = c.Description,
            AdminNote = c.AdminNote,
            IsBarnInsured = c.IsBarnInsured,
            BarnInsuranceCost = c.BarnInsuranceCost,
            FinalSalePrice = c.FinalSalePrice,
            BreederPayout = c.Settlement?.BreederPayout,
            Stages = c.FatteningStages.OrderBy(s => s.StageOrder).Select(s => new FatteningStageDto
            {
                StageOrder = s.StageOrder,
                StageName = s.StageName,
                FeedConcentrateKg = s.FeedConcentrateKg,
                RoughageKg = s.RoughageKg,
                Notes = s.Notes
            }).ToList(),
            MandatoryVaccines = c.VaccinePlans.Select(v => v.VaccineName).ToList()
        };
    }
}
