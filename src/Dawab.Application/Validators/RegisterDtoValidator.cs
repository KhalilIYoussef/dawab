using Dawab.Application.DTOs.Auth;
using FluentValidation;

namespace Dawab.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("الاسم بالكامل مطلوب")
            .MinimumLength(3).WithMessage("يجب ألا يقل الاسم عن 3 أحرف");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("رقم الهاتف مطلوب")
            .Matches(@"^01[0125][0-9]{8}$").WithMessage("يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("كلمة المرور مطلوبة")
            .MinimumLength(3).WithMessage("يجب ألا تقل كلمة المرور عن 3 أحرف/أرقام");
    }
}
