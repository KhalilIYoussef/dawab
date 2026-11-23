using Dawab.Application.DTOs.Cycles;

namespace Dawab.Web.ViewModels;

public class InvestModalViewModel
{
    public CycleDto Cycle { get; set; } = null!;
    public decimal Amount { get; set; }
    public int HeadsCount { get; set; } = 1;
    public bool HasAnimalInsurance { get; set; } = true;
    public decimal PlatformFee { get; set; }
    public decimal AnimalInsuranceFee { get; set; }
    public decimal TotalAmountToPay { get; set; }
}
