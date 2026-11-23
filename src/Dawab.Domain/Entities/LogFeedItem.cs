using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class LogFeedItem : BaseEntity
{
    public Guid LogId { get; set; }
    public CycleLog Log { get; set; } = null!;

    public FeedCategory Category { get; set; } = FeedCategory.Energy;
    public string ItemName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "كجم";
}
