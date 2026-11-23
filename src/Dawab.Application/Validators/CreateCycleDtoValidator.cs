using Dawab.Application.DTOs.Cycles;
using FluentValidation;

namespace Dawab.Application.Validators;

public class CreateCycleDtoValidator : AbstractValidator<CreateCycleDto>
{
    public CreateCycleDtoValidator()
    {
        RuleFor(x => x.AnimalId)
            .NotEmpty().WithMessage("نوع الحيوان مطلوب");

        RuleFor(x => x.TotalHeads)
            .GreaterThan(0).WithMessage("عدد الرؤوس يجب أن يكون رأس واحدة على الأقل");

        RuleFor(x => x.InitialWeight)
            .GreaterThan(0).WithMessage("الوزن الابتدائي يجب أن يكون أكبر من الصفر");

        RuleFor(x => x.TargetWeight)
            .GreaterThan(x => x.InitialWeight).WithMessage("الوزن المستهدف يجب أن يكون أكبر من الوزن الابتدائي");

        RuleFor(x => x.StartPricePerHead)
            .GreaterThan(0).WithMessage("تكلفة الرأس يجب أن تكون أكبر من الصفر");

        RuleFor(x => x.ExpectedDurationDays)
            .InclusiveBetween(1, 3650).WithMessage("مدة الدورة يجب أن تكون بين يوم و10 سنوات");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("يرجى كتابة وصف تفصيلي للدورة");
    }
}
