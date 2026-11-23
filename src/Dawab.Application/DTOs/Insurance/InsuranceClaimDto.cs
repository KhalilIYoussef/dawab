using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Insurance;

public class InsuranceClaimDto
{
    public Guid Id { get; set; }
    public Guid PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public Guid ClaimantId { get; set; }
    public string ClaimantName { get; set; } = string.Empty;
    public DateTime IncidentDate { get; set; }
    public string IncidentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ClaimAmount { get; set; }
    public decimal ApprovedAmount { get; set; }
    public ClaimStatus Status { get; set; }
}
