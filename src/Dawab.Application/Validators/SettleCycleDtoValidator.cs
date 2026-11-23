using Dawab.Application.DTOs.Settlements;
using FluentValidation;

namespace Dawab.Application.Validators;

public class SettleCycleDtoValidator : AbstractValidator<SettleCycleDto>
{
    public SettleCycleDtoValidator()
    {
        RuleFor(x => x.CycleId)
            .NotEmpty().WithMessage("معرف الدورة مطلوب");

        RuleFor(x => x.FinalSalePrice)
            .GreaterThan(0).WithMessage("سعر البيع النهائي يجب أن يكون أكبر من الصفر");
    }
}
