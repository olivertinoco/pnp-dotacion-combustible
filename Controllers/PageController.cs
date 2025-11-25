using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;

namespace PnpDotacionCombustible.Controllers;

public class PageController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public PageController(ILogger<HomeController> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }

    [HttpPost("/Page/GrabarTarjetaMultiflotaMasivo")]
    public string GrabarTarjetaMultiflotaMasivo()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_prog_tarjeta_multiflota_carga_masivo", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Page/DescargarPlantillaMultiflota")]
    public IActionResult DescargarPlantilla()
    {
        try
        {
            var filePath = Path.Combine(_env.WebRootPath, "files", "plantilla.xlsx");
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("No existe la plantilla.");

            }
            var mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            return PhysicalFile(filePath, mime, "plantilla.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return StatusCode(500, "Ocurrió un error al descargar la plantilla.");
        }
    }


}
