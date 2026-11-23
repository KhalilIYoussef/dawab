using Dawab.Application.DTOs.Auth;
using FluentValidation;

namespace Dawab.Application.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("رقم الهاتف مطلوب")
            .Matches(@"^01[0125][0-9]{8}$").WithMessage("رقم الهاتف غير صالح");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("كلمة المرور مطلوبة");
    }
}
