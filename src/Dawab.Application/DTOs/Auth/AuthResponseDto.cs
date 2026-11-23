using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Auth;

public class AuthResponseDto
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string Token { get; set; } = string.Empty;
}
