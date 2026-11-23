using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Logs;
using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class MonitoringService : IMonitoringService
{
    private readonly IApplicationDbContext _context;

    public MonitoringService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CycleLogDto> AddDailyLogAsync(Guid cycleId, CreateCycleLogDto dto)
    {
        var log = new CycleLog
        {
            CycleId = cycleId,
            LogDate = DateTime.UtcNow.Date,
            CurrentWeight = dto.CurrentWeight,
            FoodSummary = dto.FoodSummary ?? "تغذية روتينية",
            WaterLiters = dto.WaterLiters,
            Notes = dto.Notes
        };

        if (dto.FeedItems.Any())
        {
            foreach (var item in dto.FeedItems)
            {
                log.FeedItems.Add(new LogFeedItem
                {
                    Category = item.Category,
                    ItemName = item.ItemName,
                    Quantity = item.Quantity,
                    Unit = item.Unit
                });
            }
        }

        if (dto.VetRecords.Any())
        {
            foreach (var vet in dto.VetRecords)
            {
                log.VetRecords.Add(new LogVetRecord
                {
                    RecordType = vet.RecordType,
                    Title = vet.Title,
                    Dosage = vet.Dosage,
                    Notes = vet.Notes
                });
            }
        }

        if (dto.ImageUrls.Any())
        {
            foreach (var img in dto.ImageUrls)
            {
                log.Images.Add(new CycleLogImage
                {
                    ImageUrl = img
                });
            }
        }

        _context.CycleLogs.Add(log);
        await _context.SaveChangesAsync();

        return MapToDto(log);
    }

    public async Task<List<CycleLogDto>> GetCycleTimelineAsync(Guid cycleId)
    {
        var logs = await _context.CycleLogs
            .Include(l => l.FeedItems)
            .Include(l => l.VetRecords)
            .Include(l => l.Images)
            .Where(l => l.CycleId == cycleId)
            .OrderByDescending(l => l.LogDate)
            .AsNoTracking()
            .ToListAsync();

        return logs.Select(MapToDto).ToList();
    }

    private static CycleLogDto MapToDto(CycleLog l)
    {
        return new CycleLogDto
        {
            Id = l.Id,
            CycleId = l.CycleId,
            LogDate = l.LogDate,
            CurrentWeight = l.CurrentWeight,
            FoodSummary = l.FoodSummary,
            WaterLiters = l.WaterLiters,
            Notes = l.Notes,
            FeedItems = l.FeedItems.Select(f => new FeedItemDto
            {
                Category = f.Category,
                ItemName = f.ItemName,
                Quantity = f.Quantity,
                Unit = f.Unit
            }).ToList(),
            VetRecords = l.VetRecords.Select(v => new VetRecordDto
            {
                RecordType = v.RecordType,
                Title = v.Title,
                Dosage = v.Dosage,
                Notes = v.Notes
            }).ToList(),
            ImageUrls = l.Images.Select(i => i.ImageUrl).ToList()
        };
    }
}
