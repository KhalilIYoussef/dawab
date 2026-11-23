using Dawab.Application.Common.Interfaces;
using Dawab.Application.DTOs.Auth;
using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;

    public AuthService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Phone == dto.Phone);
        if (existingUser)
        {
            throw new InvalidOperationException("رقم الهاتف مسجل بالفعل في النظام.");
        }

        var user = new User
        {
            Name = dto.Name,
            Phone = dto.Phone,
            PasswordHash = HashPassword(dto.Password),
            Role = dto.Role,
            Status = UserStatus.Pending // All new users start as Pending until KYC / Admin review
        };

        if (dto.Role == UserRole.Breeder)
        {
            user.BreederProfile = new BreederProfile
            {
                FarmName = dto.FarmName ?? $"مزرعة {dto.Name}",
                Governorate = dto.Governorate ?? "الشرقية",
                AvailableSpace = 10,
                SpaceLimit = 10
            };
        }

        if (!string.IsNullOrEmpty(dto.NationalId) || !string.IsNullOrEmpty(dto.Iban))
        {
            user.KycDocument = new KycDocument
            {
                NationalId = dto.NationalId,
                BankName = dto.BankName,
                Iban = dto.Iban,
                IsVerified = false
            };
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            UserId = user.Id,
            Name = user.Name,
            Phone = user.Phone,
            Role = user.Role,
            Status = user.Status,
            Token = user.Id.ToString() // In full JWT setup, sign token here
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.BreederProfile)
            .Include(u => u.KycDocument)
            .FirstOrDefaultAsync(u => u.Phone == dto.Phone);

        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
        {
            return null;
        }

        return new AuthResponseDto
        {
            UserId = user.Id,
            Name = user.Name,
            Phone = user.Phone,
            Role = user.Role,
            Status = user.Status,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Token = user.Id.ToString()
        };
    }

    public async Task<bool> VerifyUserKycAsync(Guid userId, bool approve, string? reason = null)
    {
        var user = await _context.Users
            .Include(u => u.KycDocument)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        user.Status = approve ? UserStatus.Active : UserStatus.Rejected;
        if (user.KycDocument != null)
        {
            user.KycDocument.IsVerified = approve;
            user.KycDocument.RejectionReason = approve ? null : reason;
            user.KycDocument.ReviewedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> VerifyBreederPhysicalPapersAsync(Guid breederId, bool approve)
    {
        var profile = await _context.BreederProfiles
            .FirstOrDefaultAsync(b => b.UserId == breederId);

        if (profile == null) return false;

        profile.PhysicalPapersVerified = approve;
        if (approve)
        {
            profile.VerifiedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}
