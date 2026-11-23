namespace Dawab.Domain.Entities;

public class CycleLogImage : BaseEntity
{
    public Guid LogId { get; set; }
    public CycleLog Log { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
}
