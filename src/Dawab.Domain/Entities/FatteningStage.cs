namespace Dawab.Domain.Entities;

public class FatteningStage : BaseEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public int StageOrder { get; set; }
    public string StageName { get; set; } = string.Empty; // مرحلة التحضين، مرحلة النمو، مرحلة التشطيب
    public decimal FeedConcentrateKg { get; set; }
    public decimal RoughageKg { get; set; }
    public string? Notes { get; set; }
}
