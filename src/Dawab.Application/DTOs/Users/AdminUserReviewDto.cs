using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Users;

public class AdminUserReviewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool HasKycDocument { get; set; }
    public string? NationalId { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? IdCardFrontUrl { get; set; }
    public string? IdCardBackUrl { get; set; }
    public string? ContractUrl { get; set; }
    public bool IsKycVerified { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? FarmName { get; set; }
    public string? Governorate { get; set; }
    public string? Address { get; set; }
    public string? CriminalRecordUrl { get; set; }
    public bool PhysicalPapersSent { get; set; }
    public bool PhysicalPapersVerified { get; set; }
    public DateTime? PhysicalPapersVerifiedAt { get; set; }
}
