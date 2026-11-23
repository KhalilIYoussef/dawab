namespace Dawab.Application.DTOs.Cycles;

public class CreateCycleDto
{
    public Guid AnimalId { get; set; }
    public string AnimalType { get; set; } = string.Empty;
    public decimal InitialWeight { get; set; }
    public decimal TargetWeight { get; set; }
    public int TotalHeads { get; set; } = 1;
    public decimal StartPricePerHead { get; set; }
    public decimal FundingGoal { get; set; }
    public int ExpectedDurationDays { get; set; } = 180;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsBarnInsured { get; set; } = true;

    public List<FatteningStageDto> Stages { get; set; } = new();
    public List<string> VaccineNames { get; set; } = new();
}
