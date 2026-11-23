namespace Dawab.Application.DTOs.Insurance;

public class CreateClaimDto
{
    public Guid PolicyId { get; set; }
    public DateTime IncidentDate { get; set; }
    public string IncidentType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ClaimAmount { get; set; }
    public string? VetInspectionReportUrl { get; set; }
}
