namespace Dawab.Application.DTOs.Settlements;

public class SettlementInvestorPayoutDto
{
    public Guid Id { get; set; }
    public Guid SettlementId { get; set; }
    public Guid InvestmentId { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string CycleAnimalType { get; set; } = string.Empty;
    public decimal CapitalReturned { get; set; }
    public decimal ProfitShare { get; set; }
    public decimal TotalPayout { get; set; }
    public bool IsTransferred { get; set; }
    public string? TransferReference { get; set; }
    public DateTime? TransferredAt { get; set; }
}
