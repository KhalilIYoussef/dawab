namespace Dawab.Application.DTOs.Settlements;

public class CycleSettlementDto
{
    public Guid CycleId { get; set; }
    public string CycleAnimalType { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal InitialFunding { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal PlatformCommission { get; set; }
    public decimal BreederPayout { get; set; }
    public decimal TotalInvestorsPayout { get; set; }
    public DateTime SettlementDate { get; set; }
}
