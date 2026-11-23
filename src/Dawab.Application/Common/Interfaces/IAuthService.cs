using Dawab.Application.DTOs.Auth;
using Dawab.Domain.Enums;

namespace Dawab.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<bool> VerifyUserKycAsync(Guid userId, bool approve, string? reason = null);
    Task<bool> VerifyBreederPhysicalPapersAsync(Guid breederId, bool approve);
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
