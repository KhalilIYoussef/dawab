using Dawab.Application.DTOs.Ai;

namespace Dawab.Application.Common.Interfaces;

public interface IAiRiskService
{
    Task<AiRiskReportDto> AnalyzeCycleRiskAsync(Guid cycleId);
}
