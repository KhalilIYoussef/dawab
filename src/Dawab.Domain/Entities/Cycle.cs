using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class Cycle : BaseEntity
{
    public Guid BreederId { get; set; }
    public User Breeder { get; set; } = null!;

    public Guid? AnimalId { get; set; }
    public Animal? Animal { get; set; }
    public string AnimalType { get; set; } = string.Empty;
    public decimal InitialWeight { get; set; }
    public decimal TargetWeight { get; set; }

    public int TotalHeads { get; set; } = 1;
    public int AvailableHeads { get; set; } = 1;
    public decimal StartPricePerHead { get; set; }
    public decimal FundingGoal { get; set; }
    public decimal CurrentFunding { get; set; } = 0.0m;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public int ExpectedDurationDays { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public CycleStatus Status { get; set; } = CycleStatus.Pending;

    public string ImageUrl { get; set; } = string.Empty;
    public string? HealthCertUrl { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? AdminNote { get; set; }

    // Barn Insurance (Breeder side)
    public bool IsBarnInsured { get; set; } = false;
    public decimal BarnInsuranceCost { get; set; } = 0.0m;
    public string? InsurancePolicyNumber { get; set; }

    // Completion / Sales
    public decimal? FinalSalePrice { get; set; }

    // Navigation properties
    public ICollection<FatteningStage> FatteningStages { get; set; } = new List<FatteningStage>();
    public ICollection<CycleVaccinePlan> VaccinePlans { get; set; } = new List<CycleVaccinePlan>();
    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
    public ICollection<CycleLog> Logs { get; set; } = new List<CycleLog>();
    public CycleSettlement? Settlement { get; set; }
    public ICollection<AiRiskAssessment> AiAssessments { get; set; } = new List<AiRiskAssessment>();
}
