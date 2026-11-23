using Dawab.Application.DTOs.Settlements;

namespace Dawab.Application.Common.Interfaces;

public interface ISettlementService
{
    Task<CycleSettlementDto> SettleCycleAsync(Guid adminId, SettleCycleDto dto);
    Task<CycleSettlementDto?> GetSettlementByCycleIdAsync(Guid cycleId);
    Task<bool> MarkPayoutTransferredAsync(Guid payoutId, string transferReference);
}
