namespace Dawab.Application.DTOs.Investments;

public class CreateInvestmentDto
{
    public Guid CycleId { get; set; }
    public decimal Amount { get; set; }
    public int HeadsCount { get; set; } = 1;
    public bool HasAnimalInsurance { get; set; } = true;
    public string? TransferReceiptUrl { get; set; }
    public string? BankReferenceNumber { get; set; }
}
