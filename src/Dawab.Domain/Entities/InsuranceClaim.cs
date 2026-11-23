using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class InsuranceClaim : BaseEntity
{
    public Guid PolicyId { get; set; }
    public InsurancePolicy Policy { get; set; } = null!;

    public Guid ClaimantId { get; set; }
    public User Claimant { get; set; } = null!;

    public DateTime IncidentDate { get; set; }
    public string IncidentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ClaimAmount { get; set; }
    public decimal ApprovedAmount { get; set; } = 0.0m;
    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;

    public string? VetInspectionReportUrl { get; set; }
    public string? ResolutionNotes { get; set; }
    public Guid? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
