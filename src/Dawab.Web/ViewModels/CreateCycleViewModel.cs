using System.ComponentModel.DataAnnotations;
using Dawab.Application.DTOs.Cycles;

namespace Dawab.Web.ViewModels;

public class CreateCycleViewModel : IValidatableObject
{
    public Guid AnimalId { get; set; }
    public List<AnimalDto> Animals { get; set; } = new();

    [Range(typeof(decimal), "0.1", "10000", ErrorMessage = "أدخل وزناً صحيحاً أكبر من صفر.")]
    public decimal InitialWeight { get; set; }

    [Range(typeof(decimal), "0.1", "10000", ErrorMessage = "أدخل وزناً مستهدفاً صحيحاً.")]
    public decimal TargetWeight { get; set; }

    [Range(1, 10000, ErrorMessage = "عدد الرؤوس يجب أن يكون واحداً على الأقل.")]
    public int TotalHeads { get; set; } = 1;

    [Range(typeof(decimal), "1", "100000000", ErrorMessage = "أدخل تكلفة صحيحة للرأس.")]
    public decimal StartPricePerHead { get; set; }

    [Range(1, 3650, ErrorMessage = "مدة الدورة يجب أن تكون بين يوم و10 سنوات.")]
    public int ExpectedDurationDays { get; set; }

    [Required(ErrorMessage = "اكتب وصفاً للدورة.")]
    [StringLength(2000, ErrorMessage = "الوصف طويل جداً.")]
    public string Description { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
    public bool IsBarnInsured { get; set; } = true;

    public List<FatteningStageDto> Stages { get; set; } = new();
    public List<string> VaccineNames { get; set; } = new();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (AnimalId == Guid.Empty)
        {
            yield return new ValidationResult("اختر نوع الحيوان من القائمة.", new[] { nameof(AnimalId) });
        }

        if (TargetWeight <= InitialWeight)
        {
            yield return new ValidationResult("الوزن المستهدف يجب أن يكون أكبر من الوزن الحالي.", new[] { nameof(TargetWeight) });
        }

        if (Stages == null || !Stages.Any(stage => stage != null && !string.IsNullOrWhiteSpace(stage.StageName)))
        {
            yield return new ValidationResult("أدخل مرحلة تغذية واحدة على الأقل.", new[] { nameof(Stages) });
        }
        else if (Stages.Any(stage => stage == null || stage.FeedConcentrateKg < 0 || stage.RoughageKg < 0))
        {
            yield return new ValidationResult("كميات العلف لا يمكن أن تكون سالبة.", new[] { nameof(Stages) });
        }
    }
}
