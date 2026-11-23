using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class Investment : BaseEntity
{
    public Guid InvestorId { get; set; }
    public User Investor { get; set; } = null!;

    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public decimal Amount { get; set; }
    public int HeadsCount { get; set; } = 1;

    public decimal PlatformFee { get; set; } = 0.0m; // 2.5%
    public bool HasAnimalInsurance { get; set; } = true;
    public decimal AnimalInsuranceFee { get; set; } = 0.0m; // 3.0%
    public decimal TotalPaid { get; set; }

    public string? TransferReceiptUrl { get; set; }
    public string? BankReferenceNumber { get; set; }
    public InvestmentStatus Status { get; set; } = InvestmentStatus.PendingApproval;
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<ContractHead> Contracts { get; set; } = new List<ContractHead>();
}
