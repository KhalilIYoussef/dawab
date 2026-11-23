namespace Dawab.Web.ViewModels;

public class AddDailyLogViewModel
{
    public Guid CycleId { get; set; }
    public decimal? CurrentWeight { get; set; }
    public decimal FeedConcentrateKg { get; set; } = 4.0m;
    public decimal RoughageKg { get; set; } = 2.0m;
    public int? WaterLiters { get; set; } = 30;
    public string? VaccineApplied { get; set; }
    public string? TreatmentApplied { get; set; }
    public string? GeneralNotes { get; set; }
}
