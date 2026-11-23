namespace Dawab.Domain.Entities;

public class KycDocument : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? NationalId { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? IdCardFrontUrl { get; set; }
    public string? IdCardBackUrl { get; set; }
    public string? ContractUrl { get; set; }
    public bool IsVerified { get; set; } = false;
    public string? RejectionReason { get; set; }
    public Guid? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
