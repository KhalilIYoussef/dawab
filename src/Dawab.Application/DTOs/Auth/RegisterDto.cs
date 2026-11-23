using Dawab.Domain.Enums;

namespace Dawab.Application.DTOs.Auth;

public class RegisterDto
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Investor;

    // Optional initial KYC / Breeder info
    public string? Governorate { get; set; }
    public string? FarmName { get; set; }
    public string? NationalId { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
}
