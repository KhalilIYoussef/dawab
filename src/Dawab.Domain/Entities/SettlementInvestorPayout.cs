namespace Dawab.Domain.Entities;

public class SettlementInvestorPayout : BaseEntity
{
    public Guid SettlementId { get; set; }
    public CycleSettlement Settlement { get; set; } = null!;

    public Guid InvestmentId { get; set; }
    public Investment Investment { get; set; } = null!;

    public Guid InvestorId { get; set; }
    public User Investor { get; set; } = null!;

    public decimal CapitalReturned { get; set; }
    public decimal ProfitShare { get; set; }
    public decimal TotalPayout { get; set; }

    public bool IsTransferred { get; set; } = false;
    public string? TransferReference { get; set; }
    public DateTime? TransferredAt { get; set; }
}
