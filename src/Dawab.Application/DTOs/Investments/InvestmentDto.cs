using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Investments;

public class InvestmentDto
{
    public Guid Id { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string InvestorPhone { get; set; } = string.Empty;

    public Guid CycleId { get; set; }
    public string CycleAnimalType { get; set; } = string.Empty;
    public string? CycleImageUrl { get; set; }

    public decimal Amount { get; set; }
    public int HeadsCount { get; set; }
    public decimal PlatformFee { get; set; }
    public bool HasAnimalInsurance { get; set; }
    public decimal AnimalInsuranceFee { get; set; }
    public decimal TotalPaid { get; set; }

    public string? TransferReceiptUrl { get; set; }
    public InvestmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal? CapitalReturned { get; set; }
    public decimal? ProfitShare { get; set; }
    public decimal? TotalPayout { get; set; }
    public bool IsPayoutTransferred { get; set; }
    public string? PayoutTransferReference { get; set; }
    public List<string> ContractCodes { get; set; } = new();
}
