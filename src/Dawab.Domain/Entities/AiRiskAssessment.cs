namespace Dawab.Domain.Entities;

public class AiRiskAssessment : BaseEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public string ModelVersion { get; set; } = "gemini-3-pro-preview";
    public string PromptPayload { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public decimal? RiskScore { get; set; }
}
