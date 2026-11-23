namespace Dawab.Application.DTOs.Settlements;

public class SettleCycleDto
{
    public Guid CycleId { get; set; }
    public decimal FinalSalePrice { get; set; }
    public string? Notes { get; set; }
}
