using Dawab.Application.DTOs.Investments;
using FluentValidation;

namespace Dawab.Application.Validators;

public class CreateInvestmentDtoValidator : AbstractValidator<CreateInvestmentDto>
{
    public CreateInvestmentDtoValidator()
    {
        RuleFor(x => x.CycleId)
            .NotEmpty().WithMessage("معرف الدورة مطلوب");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(500).WithMessage("أقل مبلغ للاستثمار هو 500 جنيه مصري");

        RuleFor(x => x.HeadsCount)
            .GreaterThan(0).WithMessage("عدد الرؤوس يجب ألا يقل عن رأس واحدة");
    }
}
