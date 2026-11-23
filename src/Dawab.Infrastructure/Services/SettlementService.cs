using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Settlements;
using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class SettlementService : ISettlementService
{
    private readonly IApplicationDbContext _context;
    private const decimal PlatformCommissionRate = 0.10m; // 10% of gross profit to platform
    private const decimal BreederProfitShareRate = 0.30m;  // 30% of profit to breeder

    public SettlementService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CycleSettlementDto> SettleCycleAsync(Guid adminId, SettleCycleDto dto)
    {
        var cycle = await _context.Cycles
            .Include(c => c.Investments)
                .ThenInclude(i => i.Investor)
            .FirstOrDefaultAsync(c => c.Id == dto.CycleId);

        if (cycle == null)
        {
            throw new InvalidOperationException("دورة التسمين غير موجودة.");
        }

        if (cycle.Status != CycleStatus.Active
            || await _context.CycleSettlements.AnyAsync(settlement => settlement.CycleId == dto.CycleId))
        {
            throw new InvalidOperationException("لا يمكن تسوية الدورة إلا إذا كانت نشطة ولم يسبق تسويتها.");
        }

        if (dto.FinalSalePrice <= 0)
        {
            throw new InvalidOperationException("أدخل قيمة البيع الفعلية أكبر من صفر.");
        }

        cycle.Status = CycleStatus.Completed;
        cycle.ActualEndDate = DateTime.UtcNow;
        cycle.FinalSalePrice = dto.FinalSalePrice;

        var totalRevenue = dto.FinalSalePrice;
        var approvedInvestments = cycle.Investments.Where(i => i.Status == InvestmentStatus.Approved).ToList();
        var initialFunding = approvedInvestments.Sum(investment => investment.Amount);
        if (initialFunding <= 0)
        {
            throw new InvalidOperationException("لا توجد استثمارات معتمدة لتسويتها.");
        }

        var grossProfit = Math.Max(0, totalRevenue - initialFunding);

        var platformCommission = Math.Round(grossProfit * PlatformCommissionRate, 2);
        var remainingProfit = grossProfit - platformCommission;

        var breederPayout = Math.Round(remainingProfit * BreederProfitShareRate, 2);
        var totalInvestorsProfit = remainingProfit - breederPayout;

        var settlement = new CycleSettlement
        {
            CycleId = cycle.Id,
            SettledBy = adminId,
            TotalRevenue = totalRevenue,
            InitialFunding = initialFunding,
            GrossProfit = grossProfit,
            PlatformCommission = platformCommission,
            BreederPayout = breederPayout,
            TotalInvestorsPayout = Math.Min(totalRevenue, initialFunding) + totalInvestorsProfit,
            Notes = dto.Notes
        };

        var totalInvested = approvedInvestments.Sum(investment => investment.Amount);
        var capitalReturnPool = Math.Min(totalRevenue, initialFunding);
        var payouts = new List<SettlementInvestorPayout>();
        var remainingCapitalReturn = capitalReturnPool;
        var remainingProfitShare = totalInvestorsProfit;
        for (var index = 0; index < approvedInvestments.Count; index++)
        {
            var investment = approvedInvestments[index];
            var isLastPayout = index == approvedInvestments.Count - 1;
            var shareRatio = investment.Amount / totalInvested;
            var capitalReturned = isLastPayout ? remainingCapitalReturn : Math.Round(capitalReturnPool * shareRatio, 2);
            var profitShare = isLastPayout ? remainingProfitShare : Math.Round(totalInvestorsProfit * shareRatio, 2);
            remainingCapitalReturn -= capitalReturned;
            remainingProfitShare -= profitShare;
            payouts.Add(new SettlementInvestorPayout
            {
                InvestmentId = investment.Id,
                InvestorId = investment.InvestorId,
                CapitalReturned = capitalReturned,
                ProfitShare = profitShare,
                TotalPayout = capitalReturned + profitShare
            });
        }
        foreach (var payout in payouts)
        {
            settlement.InvestorPayouts.Add(payout);
        }

        _context.CycleSettlements.Add(settlement);
        await _context.SaveChangesAsync();

        return new CycleSettlementDto
        {
            CycleId = cycle.Id,
            CycleAnimalType = cycle.AnimalType,
            TotalRevenue = settlement.TotalRevenue,
            InitialFunding = settlement.InitialFunding,
            GrossProfit = settlement.GrossProfit,
            PlatformCommission = settlement.PlatformCommission,
            BreederPayout = settlement.BreederPayout,
            TotalInvestorsPayout = settlement.TotalInvestorsPayout,
            SettlementDate = settlement.SettlementDate
        };
    }

    public async Task<bool> MarkPayoutTransferredAsync(Guid payoutId, string transferReference)
    {
        var normalizedReference = transferReference?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedReference) || normalizedReference.Length > 100)
        {
            return false;
        }

        var payout = await _context.SettlementInvestorPayouts.FirstOrDefaultAsync(item => item.Id == payoutId);
        if (payout == null || payout.IsTransferred)
        {
            return false;
        }

        payout.IsTransferred = true;
        payout.TransferReference = normalizedReference;
        payout.TransferredAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CycleSettlementDto?> GetSettlementByCycleIdAsync(Guid cycleId)
    {
        var settlement = await _context.CycleSettlements
            .Include(s => s.Cycle)
            .FirstOrDefaultAsync(s => s.CycleId == cycleId);

        if (settlement == null) return null;

        return new CycleSettlementDto
        {
            CycleId = settlement.CycleId,
            CycleAnimalType = settlement.Cycle.AnimalType,
            TotalRevenue = settlement.TotalRevenue,
            InitialFunding = settlement.InitialFunding,
            GrossProfit = settlement.GrossProfit,
            PlatformCommission = settlement.PlatformCommission,
            BreederPayout = settlement.BreederPayout,
            TotalInvestorsPayout = settlement.TotalInvestorsPayout,
            SettlementDate = settlement.SettlementDate
        };
    }
}
