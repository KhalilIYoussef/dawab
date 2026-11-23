using Dawab.Application.DTOs.Insurance;
using FluentValidation;

namespace Dawab.Application.Validators;

public class CreateClaimDtoValidator : AbstractValidator<CreateClaimDto>
{
    public CreateClaimDtoValidator()
    {
        RuleFor(x => x.PolicyId)
            .NotEmpty().WithMessage("معرف وثيقة التأمين مطلوب");

        RuleFor(x => x.IncidentType)
            .NotEmpty().WithMessage("نوع الحادث أو سبب المطالبة مطلوب");

        RuleFor(x => x.ClaimAmount)
            .GreaterThan(0).WithMessage("مبلغ التعويض المطلوب يجب أن يكون أكبر من الصفر");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("تفاصيل الحادث مطلوبة");
    }
}
