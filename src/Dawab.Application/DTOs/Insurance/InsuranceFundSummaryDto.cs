namespace Dawab.Application.DTOs.Insurance;

public class InsuranceFundSummaryDto
{
    public decimal TotalFundBalance { get; set; }
    public decimal TotalAnimalLifeInsuranceCollected { get; set; }
    public int AnimalPoliciesCount { get; set; }
    public decimal TotalBarnInsuranceCollected { get; set; }
    public int BarnPoliciesCount { get; set; }
    public decimal TotalClaimsPaid { get; set; }
    public int ActiveClaimsCount { get; set; }
}
