using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Users;

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? FarmName { get; set; }
    public string? Governorate { get; set; }
    public bool PhysicalPapersVerified { get; set; }
    public bool IsKycVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
