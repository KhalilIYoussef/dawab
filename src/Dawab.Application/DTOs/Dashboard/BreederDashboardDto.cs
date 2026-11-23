using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Users;

namespace Dawab.Application.DTOs.Dashboard;

public class BreederDashboardDto
{
    public UserDto Breeder { get; set; } = null!;
    public List<CycleDto> Cycles { get; set; } = new();
    public int ActiveCyclesCount { get; set; }
    public int AvailableSpace { get; set; }
    public int SpaceLimit { get; set; }
    public decimal Rating { get; set; }
    public decimal TotalRaisedFunds { get; set; }
}
