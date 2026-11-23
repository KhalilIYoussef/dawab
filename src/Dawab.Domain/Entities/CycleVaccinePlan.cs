namespace Dawab.Domain.Entities;

public class CycleVaccinePlan : BaseEntity
{
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public string VaccineName { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
    public int? RecommendedDayOffset { get; set; }
}
