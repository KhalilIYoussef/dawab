using Dawab.Application.DTOs.Cycles;
using Dawab.Domain.Enums;

namespace Dawab.Application.Common.Interfaces;

public interface ICycleService
{
    Task<List<AnimalDto>> GetAvailableAnimalsAsync();
    Task<List<CycleDto>> GetAllCyclesAsync(CycleStatus? status = null);
    Task<List<CycleDto>> GetBreederCyclesAsync(Guid breederId);
    Task<CycleDto?> GetCycleByIdAsync(Guid id);
    Task<CycleDto> CreateCycleAsync(Guid breederId, CreateCycleDto dto);
    Task<bool> ApproveCycleAsync(Guid cycleId, Guid adminId);
    Task<bool> StartProductionAsync(Guid cycleId);
    Task<bool> RejectCycleAsync(Guid cycleId, Guid adminId, string? reason);
}
