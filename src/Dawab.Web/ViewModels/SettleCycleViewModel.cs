using System.ComponentModel.DataAnnotations;

namespace Dawab.Web.ViewModels;

public class SettleCycleViewModel
{
    public Guid CycleId { get; set; }
    public string AnimalType { get; set; } = string.Empty;
    public decimal FundingGoal { get; set; }

    [Range(typeof(decimal), "0.01", "999999999999", ErrorMessage = "أدخل سعر البيع الفعلي أكبر من صفر.")]
    public decimal FinalSalePrice { get; set; }
    public string? Notes { get; set; }
}
