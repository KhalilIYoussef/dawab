namespace Dawab.Domain.Entities;

public class CycleLog : BaseEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public DateTime LogDate { get; set; } = DateTime.UtcNow.Date;
    public decimal? CurrentWeight { get; set; }
    public string FoodSummary { get; set; } = "تغذية روتينية";
    public int? WaterLiters { get; set; }
    public string? Notes { get; set; }

    public ICollection<LogFeedItem> FeedItems { get; set; } = new List<LogFeedItem>();
    public ICollection<LogVetRecord> VetRecords { get; set; } = new List<LogVetRecord>();
    public ICollection<CycleLogImage> Images { get; set; } = new List<CycleLogImage>();
}
