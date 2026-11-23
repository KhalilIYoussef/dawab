using Dawab.Domain.Enums;

namespace Dawab.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Investor;
    public UserStatus Status { get; set; } = UserStatus.Pending;
    public string? ProfilePictureUrl { get; set; }

    // Navigation properties
    public BreederProfile? BreederProfile { get; set; }
    public KycDocument? KycDocument { get; set; }
    public ICollection<Cycle> BreederCycles { get; set; } = new List<Cycle>();
    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
    public ICollection<InsuranceClaim> FiledClaims { get; set; } = new List<InsuranceClaim>();
}
