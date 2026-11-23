using Dawab.Application.DTOs.Dashboard;

namespace Dawab.Application.Common.Interfaces;

public interface IHomeService
{
    Task<HomeDashboardDto> GetHomeDataAsync();
}
