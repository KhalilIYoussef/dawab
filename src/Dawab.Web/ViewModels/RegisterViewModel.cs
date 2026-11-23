using Dawab.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dawab.Web.ViewModels;

public class RegisterViewModel
{
    [Required(ErrorMessage = "الاسم بالكامل مطلوب")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "رقم الهاتف مطلوب")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "كلمة المرور مطلوبة")]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Investor;
    public string? Governorate { get; set; }
    public string? FarmName { get; set; }
    public string? NationalId { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
}
