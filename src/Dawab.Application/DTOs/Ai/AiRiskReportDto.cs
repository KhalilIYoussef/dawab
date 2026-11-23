namespace Dawab.Application.DTOs.Ai;

public class AiRiskReportDto
{
    public Guid CycleId { get; set; }
    public string AnimalType { get; set; } = string.Empty;
    public string AnalysisReport { get; set; } = string.Empty;
    public decimal? RiskScore { get; set; } // 1 to 10
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
