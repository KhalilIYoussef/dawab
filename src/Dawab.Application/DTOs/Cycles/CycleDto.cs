using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Cycles;

public class CycleDto
{
    public Guid Id { get; set; }
    public Guid BreederId { get; set; }
    public Guid? AnimalId { get; set; }
    public string BreederName { get; set; } = string.Empty;
    public decimal BreederRating { get; set; }
    public string? BreederGovernorate { get; set; }

    public string AnimalType { get; set; } = string.Empty;
    public decimal InitialWeight { get; set; }
    public decimal TargetWeight { get; set; }

    public int TotalHeads { get; set; }
    public int AvailableHeads { get; set; }
    public decimal StartPricePerHead { get; set; }
    public decimal FundingGoal { get; set; }
    public decimal CurrentFunding { get; set; }
    public int FundingProgressPercentage => FundingGoal > 0 ? (int)Math.Min(100, Math.Floor((CurrentFunding / FundingGoal) * 100)) : 0;
    public decimal RemainingFunding => Math.Max(0, FundingGoal - CurrentFunding);

    public DateTime StartDate { get; set; }
    public int ExpectedDurationDays { get; set; }
    public CycleStatus Status { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AdminNote { get; set; }

    public bool IsBarnInsured { get; set; }
    public decimal BarnInsuranceCost { get; set; }
    public decimal? FinalSalePrice { get; set; }
    public decimal? BreederPayout { get; set; }

    public List<FatteningStageDto> Stages { get; set; } = new();
    public List<string> MandatoryVaccines { get; set; } = new();
}
