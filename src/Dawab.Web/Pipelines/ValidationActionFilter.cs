using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Dawab.Web.Pipelines;

public class ValidationActionFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var controller = context.Controller as Controller;
            if (controller != null && context.ActionArguments.Values.FirstOrDefault() is object model)
            {
                context.Result = controller.View(model);
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
