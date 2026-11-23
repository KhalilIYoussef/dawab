using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class LogVetRecord : BaseEntity
{
    public Guid LogId { get; set; }
    public CycleLog Log { get; set; } = null!;

    public VetRecordType RecordType { get; set; } = VetRecordType.Vaccine;
    public string Title { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public string? Notes { get; set; }
    public DateTime AdministeredAt { get; set; } = DateTime.UtcNow;
}
