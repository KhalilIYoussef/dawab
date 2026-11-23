namespace Dawab.Application.DTOs.Cycles;

public class AnimalDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DefaultInitialWeight { get; set; }
    public decimal DefaultTargetWeight { get; set; }
    public decimal DefaultPricePerHead { get; set; }
    public decimal DefaultBarnInsuranceCost { get; set; }
    public int DefaultDurationDays { get; set;}
    public bool IsActive { get; set; }
}
