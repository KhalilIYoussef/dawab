using Dawab.Application.DTOs.Logs;

namespace Dawab.Application.Common.Interfaces;

public interface IMonitoringService
{
    Task<CycleLogDto> AddDailyLogAsync(Guid cycleId, CreateCycleLogDto dto);
    Task<List<CycleLogDto>> GetCycleTimelineAsync(Guid cycleId);
}
