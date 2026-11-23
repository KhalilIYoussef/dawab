using Dawab.Application.DTOs.Cycles;

namespace Dawab.Web.ViewModels;

public class CyclesListViewModel
{
    public List<CycleDto> Cycles { get; set; } = new();
    public string? SearchTerm { get; set; }
}
