using Dawab.Application.DTOs.Logs;
using FluentValidation;

namespace Dawab.Application.Validators;

public class CreateCycleLogDtoValidator : AbstractValidator<CreateCycleLogDto>
{
    public CreateCycleLogDtoValidator()
    {
        RuleFor(x => x.CycleId)
            .NotEmpty().WithMessage("معرف الدورة مطلوب");

        RuleFor(x => x.CurrentWeight)
            .GreaterThan(0).When(x => x.CurrentWeight.HasValue).WithMessage("الوزن يجب أن يكون قيمة موجبة");
    }
}
