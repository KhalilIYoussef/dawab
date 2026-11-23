namespace Dawab.Application.DTOs.Cycles;

public class FatteningStageDto
{
    public int StageOrder { get; set; }
    public string StageName { get; set; } = string.Empty;
    public decimal FeedConcentrateKg { get; set; }
    public decimal RoughageKg { get; set; }
    public string? Notes { get; set; }
}
