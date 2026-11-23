using System.ComponentModel.DataAnnotations;

namespace Dawab.Web.ViewModels;

public class LoginViewModel
{
    [Required(ErrorMessage = "يرجى إدخال رقم الهاتف")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "يرجى إدخال كلمة المرور")]
    public string Password { get; set; } = string.Empty;
}
