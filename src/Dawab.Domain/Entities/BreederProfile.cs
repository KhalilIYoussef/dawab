namespace Dawab.Domain.Entities;

public class BreederProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? FarmName { get; set; }
    public string? Governorate { get; set; } // الشرقية، الفيوم، البحيرة...
    public string? Address { get; set; }
    public string? GoogleMapsUrl { get; set; }
    public int SpaceLimit { get; set; } = 10;
    public int AvailableSpace { get; set; } = 10;
    public decimal Rating { get; set; } = 0.0m;

    // Physical Verification & Security
    public string? CriminalRecordUrl { get; set; } // الفيش الجنائي
    public bool PhysicalPapersSent { get; set; } = false;
    public bool PhysicalPapersVerified { get; set; } = false;
    public DateTime? VerifiedAt { get; set; }
}
