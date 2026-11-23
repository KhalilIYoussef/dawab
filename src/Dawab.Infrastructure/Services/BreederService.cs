using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Cycles;
using Dawab.Application.DTOs.Dashboard;
using Dawab.Application.DTOs.Logs;
using Dawab.Application.DTOs.Users;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class BreederService : IBreederService
{
    private readonly IApplicationDbContext _context;
    private readonly ICycleService _cycleService;
    private readonly IMonitoringService _monitoringService;
    private readonly IFileStorageService _fileStorageService;

    public BreederService(
        IApplicationDbContext context,
        ICycleService cycleService,
        IMonitoringService monitoringService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _cycleService = cycleService;
        _monitoringService = monitoringService;
        _fileStorageService = fileStorageService;
    }

    public async Task<BreederDashboardDto> GetDashboardDataAsync(Guid? breederId)
    {
        if (!breederId.HasValue)
        {
            throw new InvalidOperationException("يجب تحديد حساب المربي لعرض لوحة التحكم.");
        }

        var targetId = breederId.Value;
        var breeder = await _context.Users
            .Include(u => u.BreederProfile)
            .Include(u => u.KycDocument)
            .FirstOrDefaultAsync(u => u.Id == targetId && u.Role == UserRole.Breeder);

        if (breeder == null)
        {
            throw new InvalidOperationException("لم يتم العثور على حساب المربي.");
        }

        var cycles = await _cycleService.GetBreederCyclesAsync(targetId);

        return new BreederDashboardDto
        {
            Breeder = new UserDto
            {
                Id = breeder.Id,
                Name = breeder.Name,
                Phone = breeder.Phone,
                Role = breeder.Role,
                Status = breeder.Status,
                ProfilePictureUrl = breeder.ProfilePictureUrl,
                FarmName = breeder.BreederProfile?.FarmName,
                Governorate = breeder.BreederProfile?.Governorate,
                PhysicalPapersVerified = breeder.BreederProfile?.PhysicalPapersVerified ?? false,
                IsKycVerified = breeder.KycDocument?.IsVerified ?? false
            },
            Cycles = cycles,
            ActiveCyclesCount = cycles.Count(c => c.Status == CycleStatus.Active),
            AvailableSpace = breeder.BreederProfile?.AvailableSpace ?? 0,
            SpaceLimit = breeder.BreederProfile?.SpaceLimit ?? 0,
            Rating = breeder.BreederProfile?.Rating ?? 0m,
            TotalRaisedFunds = cycles.Sum(c => c.CurrentFunding)
        };
    }

    public async Task<CycleDto> CreateCycleAsync(Guid? breederId, CreateCycleDto dto, Stream? imageStream, string? fileName)
    {
        if (!breederId.HasValue || !await _context.Users.AnyAsync(user => user.Id == breederId.Value && user.Role == UserRole.Breeder))
        {
            throw new InvalidOperationException("لم يتم العثور على حساب مربي صالح لإضافة الدورة.");
        }

        var targetId = breederId.Value;
        if (imageStream != null && !string.IsNullOrEmpty(fileName))
        {
            dto.ImageUrl = await _fileStorageService.SaveFileAsync(imageStream, fileName, "animals");
        }

        return await _cycleService.CreateCycleAsync(targetId, dto);
    }

    public async Task<CycleLogDto> AddDailyLogAsync(Guid breederId, CreateCycleLogDto dto)
    {
        var ownsCycle = await _context.Cycles
            .AnyAsync(cycle => cycle.Id == dto.CycleId && cycle.BreederId == breederId);
        if (!ownsCycle)
        {
            throw new InvalidOperationException("لا يمكنك تسجيل متابعة لدورة لا تخص حسابك.");
        }

        return await _monitoringService.AddDailyLogAsync(dto.CycleId, dto);
    }
}
