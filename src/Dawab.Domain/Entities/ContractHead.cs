namespace Dawab.Domain.Entities;

public class ContractHead : BaseEntity
{
    public Guid InvestmentId { get; set; }
    public Investment Investment { get; set; } = null!;

    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public string ContractCode { get; set; } = string.Empty; // e.g. DW-101-01
    public int HeadIndex { get; set; } = 1;
    public string? PdfContractUrl { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
