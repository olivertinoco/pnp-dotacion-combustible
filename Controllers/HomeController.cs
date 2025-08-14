using Microsoft.AspNetCore.Mvc;

namespace PnpDotacionCombustible.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IWebHostEnvironment _env;

    public HomeController(ILogger<HomeController> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public IActionResult Index()
    {
        ViewBag.IsDevelopment = _env.IsDevelopment();
        return View();
    }
}
