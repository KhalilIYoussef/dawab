using System.ComponentModel.DataAnnotations;

namespace Dawab.Web.ViewModels;

public class AnimalViewModel
{
    [Required(ErrorMessage = "أدخل اسم الحيوان أو السلالة.")]
    [StringLength(120, ErrorMessage = "اسم الحيوان طويل جداً.")]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.1", "10000", ErrorMessage = "الوزن الابتدائي يجب أن يكون أكبر من صفر.")]
    public decimal DefaultInitialWeight { get; set; }

    [Range(typeof(decimal), "0.1", "10000", ErrorMessage = "الوزن المستهدف يجب أن يكون أكبر من صفر.")]
    public decimal DefaultTargetWeight { get; set; }

    [Range(typeof(decimal), "1", "100000000", ErrorMessage = "سعر الرأس يجب أن يكون أكبر من صفر.")]
    public decimal DefaultPricePerHead { get; set; }

    [Range(typeof(decimal), "0", "10000000", ErrorMessage = "رسوم التأمين لا يمكن أن تكون سالبة.")]
    public decimal DefaultBarnInsuranceCost { get; set; }

    [Range(1, 3650, ErrorMessage = "مدة الدورة يجب أن تكون بين يوم و10 سنوات.")]
    public int DefaultDurationDays { get; set; }
}
