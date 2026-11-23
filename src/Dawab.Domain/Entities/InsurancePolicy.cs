using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class InsurancePolicy : BaseEntity
{
    public string PolicyNumber { get; set; } = string.Empty;
    public PolicyType PolicyType { get; set; }
    public Guid CycleId { get; set; }
    public Cycle Cycle { get; set; } = null!;

    public Guid? InvestmentId { get; set; }
    public Investment? Investment { get; set; }

    public decimal PremiumAmount { get; set; }
    public string? CoverageDetails { get; set; }
    public PolicyStatus Status { get; set; } = PolicyStatus.Active;
    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    public ICollection<InsuranceClaim> Claims { get; set; } = new List<InsuranceClaim>();
}
