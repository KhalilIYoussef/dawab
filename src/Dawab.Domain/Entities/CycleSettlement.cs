namespace Dawab.Domain.Entities;

public class CycleSettlement : BaseEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public Guid SettledBy { get; set; }
    public User Settler { get; set; } = null!;

    public decimal TotalRevenue { get; set; }
    public decimal InitialFunding { get; set; }
    public decimal GrossProfit { get; set; } // TotalRevenue - InitialFunding

    public decimal PlatformCommission { get; set; } = 0.0m;
    public decimal BreederPayout { get; set; }
    public decimal TotalInvestorsPayout { get; set; }

    public DateTime SettlementDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }

    public ICollection<SettlementInvestorPayout> InvestorPayouts { get; set; } = new List<SettlementInvestorPayout>();
}
