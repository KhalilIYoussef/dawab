using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Logs;

namespace Dawab.Web.ViewModels;

public class CycleDetailsViewModel
{
    public CycleDto Cycle { get; set; } = null!;
    public List<CycleLogDto> Logs { get; set; } = new();
}
