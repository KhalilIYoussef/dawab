using Dawab.Application.DTOs.Cycles;
using Dawab.Domain.Entities;

namespace Dawab.Web.ViewModels;

public class BreederDashboardViewModel
{
    public User Breeder { get; set; } = null!;
    public List<CycleDto> Cycles { get; set; } = new();
    public int ActiveCyclesCount { get; set; }
    public decimal TotalRaisedFunds { get; set; }
}
