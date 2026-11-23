using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Investments;
using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IApplicationDbContext _context;
    private const decimal PlatformFeeRate = 0.025m;      // 2.5%
    private const decimal AnimalInsuranceRate = 0.03m;   // 3.0%

    public InvestmentService(IApplicationDbContext context)
    {
        _context = context;
    }

    public Task<FeeCalculationDto> CalculateFeesAsync(decimal amount, bool hasInsurance)
    {
        var platformFee = Math.Round(amount * PlatformFeeRate, 2);
        var insuranceFee = hasInsurance ? Math.Round(amount * AnimalInsuranceRate, 2) : 0m;
        var total = amount + platformFee + insuranceFee;

        var result = new FeeCalculationDto
        {
            InvestmentAmount = amount,
            PlatformFeeRate = PlatformFeeRate,
            PlatformFee = platformFee,
            HasAnimalInsurance = hasInsurance,
            AnimalInsuranceRate = AnimalInsuranceRate,
            AnimalInsuranceFee = insuranceFee,
            TotalAmountToPay = total
        };

        return Task.FromResult(result);
    }

    public async Task<InvestmentDto> CreateInvestmentAsync(Guid investorId, CreateInvestmentDto dto)
    {
        var cycle = await _context.Cycles.FirstOrDefaultAsync(c => c.Id == dto.CycleId);
        if (cycle == null)
        {
            throw new InvalidOperationException("دورة التسمين المطلوبة غير موجودة.");
        }

        if (cycle.Status != CycleStatus.Funding)
        {
            throw new InvalidOperationException("الدورة غير متاحة للاستثمار حالياً.");
        }

        if (dto.HeadsCount <= 0 || dto.Amount <= 0 || dto.Amount != cycle.StartPricePerHead * dto.HeadsCount)
        {
            throw new InvalidOperationException("مبلغ الاستثمار يجب أن يطابق تكلفة الرأس مضروبة في عدد الرؤوس.");
        }

        var pendingInvestments = await _context.Investments
            .Where(investment => investment.CycleId == dto.CycleId && investment.Status == InvestmentStatus.PendingApproval)
            .ToListAsync();
        var remaining = cycle.FundingGoal - cycle.CurrentFunding - pendingInvestments.Sum(investment => investment.Amount);
        var remainingHeads = cycle.AvailableHeads - pendingInvestments.Sum(investment => investment.HeadsCount);
        if (dto.Amount > remaining || dto.HeadsCount > remainingHeads)
        {
            throw new InvalidOperationException($"الكمية أو المبلغ المطلوب أكبر من المتاح للدورة (المتبقي {Math.Max(0, remainingHeads)} رأس، {Math.Max(0, remaining):N0} ج.م).");
        }

        var fees = await CalculateFeesAsync(dto.Amount, dto.HasAnimalInsurance);

        var investment = new Investment
        {
            InvestorId = investorId,
            CycleId = dto.CycleId,
            Amount = dto.Amount,
            HeadsCount = dto.HeadsCount,
            PlatformFee = fees.PlatformFee,
            HasAnimalInsurance = dto.HasAnimalInsurance,
            AnimalInsuranceFee = fees.AnimalInsuranceFee,
            TotalPaid = fees.TotalAmountToPay,
            TransferReceiptUrl = dto.TransferReceiptUrl,
            BankReferenceNumber = dto.BankReferenceNumber,
            Status = InvestmentStatus.PendingApproval
        };

        _context.Investments.Add(investment);
        await _context.SaveChangesAsync();

        return MapToDto(investment);
    }

    public async Task<bool> ApproveInvestmentAsync(Guid investmentId, Guid adminId)
    {
        var investment = await _context.Investments
            .Include(i => i.Cycle)
            .FirstOrDefaultAsync(i => i.Id == investmentId);

        if (investment == null
            || investment.Status != InvestmentStatus.PendingApproval
            || investment.Cycle.Status != CycleStatus.Funding
            || investment.Amount != investment.Cycle.StartPricePerHead * investment.HeadsCount
            || investment.Amount > investment.Cycle.FundingGoal - investment.Cycle.CurrentFunding
            || investment.HeadsCount > investment.Cycle.AvailableHeads)
        {
            return false;
        }

        investment.Status = InvestmentStatus.Approved;
        investment.ApprovedAt = DateTime.UtcNow;

        // Increase cycle funding
        investment.Cycle.CurrentFunding += investment.Amount;
        investment.Cycle.AvailableHeads -= investment.HeadsCount;

        // Generate Unique Contract Heads
        for (int i = 1; i <= investment.HeadsCount; i++)
        {
            var code = $"DW-{investment.Cycle.Id.ToString()[..4].ToUpper()}-{new Random().Next(100, 999)}-{i}";
            _context.ContractHeads.Add(new ContractHead
            {
                InvestmentId = investment.Id,
                CycleId = investment.CycleId,
                ContractCode = code,
                HeadIndex = i
            });
        }

        // Create Animal Life Insurance Policy if selected
        if (investment.HasAnimalInsurance)
        {
            _context.InsurancePolicies.Add(new InsurancePolicy
            {
                PolicyNumber = $"POL-LIFE-{Guid.NewGuid():N}"[..16].ToUpper(),
                PolicyType = PolicyType.AnimalLifeInsurance,
                CycleId = investment.CycleId,
                InvestmentId = investment.Id,
                PremiumAmount = investment.AnimalInsuranceFee,
                CoverageDetails = "تأمين حياة ماشية للمستثمر ضد النفوق والأمراض الوبائية",
                Status = PolicyStatus.Active
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectInvestmentAsync(Guid investmentId, Guid adminId, string? reason)
    {
        var investment = await _context.Investments.FirstOrDefaultAsync(i => i.Id == investmentId);
        if (investment == null || investment.Status != InvestmentStatus.PendingApproval) return false;

        investment.Status = InvestmentStatus.Rejected;
        investment.RejectionReason = reason;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<InvestmentDto>> GetInvestorPortfolioAsync(Guid investorId)
    {
        var investments = await _context.Investments
            .Include(i => i.Cycle)
            .Include(i => i.Contracts)
            .Include(i => i.Investor)
            .Where(i => i.InvestorId == investorId)
            .OrderByDescending(i => i.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
        var payouts = await _context.SettlementInvestorPayouts
            .Where(payout => payout.InvestorId == investorId)
            .AsNoTracking()
            .ToListAsync();
        var payoutsByInvestment = payouts.ToDictionary(payout => payout.InvestmentId);

        return investments.Select(investment =>
        {
            payoutsByInvestment.TryGetValue(investment.Id, out var payout);
            return MapToDto(investment, payout);
        }).ToList();
    }

    public async Task<List<InvestmentDto>> GetAllInvestmentsAsync()
    {
        var investments = await _context.Investments
            .Include(i => i.Cycle)
            .Include(i => i.Investor)
            .Include(i => i.Contracts)
            .OrderByDescending(i => i.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return investments.Select(investment => MapToDto(investment)).ToList();
    }

    private static InvestmentDto MapToDto(Investment i, SettlementInvestorPayout? payout = null)
    {
        return new InvestmentDto
        {
            Id = i.Id,
            InvestorId = i.InvestorId,
            InvestorName = i.Investor?.Name ?? "غير محدد",
            InvestorPhone = i.Investor?.Phone ?? string.Empty,
            CycleId = i.CycleId,
            CycleAnimalType = i.Cycle?.AnimalType ?? string.Empty,
            CycleImageUrl = i.Cycle?.ImageUrl,
            Amount = i.Amount,
            HeadsCount = i.HeadsCount,
            PlatformFee = i.PlatformFee,
            HasAnimalInsurance = i.HasAnimalInsurance,
            AnimalInsuranceFee = i.AnimalInsuranceFee,
            TotalPaid = i.TotalPaid,
            TransferReceiptUrl = i.TransferReceiptUrl,
            Status = i.Status,
            CreatedAt = i.CreatedAt,
            CapitalReturned = payout?.CapitalReturned,
            ProfitShare = payout?.ProfitShare,
            TotalPayout = payout?.TotalPayout,
            IsPayoutTransferred = payout?.IsTransferred ?? false,
            PayoutTransferReference = payout?.TransferReference,
            ContractCodes = i.Contracts.Select(c => c.ContractCode).ToList()
        };
    }
}
