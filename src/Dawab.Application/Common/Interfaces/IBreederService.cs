using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Dashboard;
using Dawab.Application.DTOs.Logs;

namespace Dawab.Application.Common.Interfaces;

public interface IBreederService
{
    Task<BreederDashboardDto> GetDashboardDataAsync(Guid? breederId);
    Task<CycleDto> CreateCycleAsync(Guid? breederId, CreateCycleDto dto, Stream? imageStream, string? fileName);
    Task<CycleLogDto> AddDailyLogAsync(Guid breederId, CreateCycleLogDto dto);
}
