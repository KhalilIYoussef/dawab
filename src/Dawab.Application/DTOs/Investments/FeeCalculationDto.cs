namespace Dawab.Application.DTOs.Investments;

public class FeeCalculationDto
{
    public decimal InvestmentAmount { get; set; }
    public decimal PlatformFeeRate { get; set; } = 0.025m; // 2.5%
    public decimal PlatformFee { get; set; }
    public bool HasAnimalInsurance { get; set; }
    public decimal AnimalInsuranceRate { get; set; } = 0.03m; // 3.0%
    public decimal AnimalInsuranceFee { get; set; }
    public decimal TotalAmountToPay { get; set; }
}
