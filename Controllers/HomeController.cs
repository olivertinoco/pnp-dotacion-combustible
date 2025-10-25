using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;

namespace PnpDotacionCombustible.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public HomeController(ILogger<HomeController> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }

    public IActionResult Index()
    {
        ViewBag.IsDevelopment = _env.IsDevelopment();
        return View();
    }

    public string TraerListaDotacionCombustible()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_listaDotacionCombustible");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    public string TraerListaOperatividadVeh()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_listaOperatividadVehiculo");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost]
    public string TraerListaMenus()
    {
        try
        {
            string rpta = "";
            string user = Request.Form["data1"].ToString();
            string clave = Request.Form["data2"].ToString();
            string usuario = $"{user}|{clave}";

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_loginXmenus", "@data", usuario);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_loginXmenus '{data}'", usuario);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en backend:");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaGeometrias")]
    public string TraerListaGeometrias()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "LOC");
            rpta = odaSQL.ejecutarComando("dbo.usp_listaGeometrias");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet]
    public async Task<IActionResult> TraerListaGeometriasAsync()
    {
        try
        {
            Response.ContentType = "application/json";
            var odaSQL = new daSQL(_configuration, "LOC");
            await odaSQL.ejecutarComandoStreamAsync("dbo.usp_listaGeometrias", Response.Body);
            return new EmptyResult(); // ya escribimos todo en Response.Body
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return StatusCode(500, "error");
        }
    }

    [HttpPost("/Home/GrabarDatosVarios")]
    public string GrabarDatosVarios()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_generico01", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaProgExtraOrd")]
    public string TraerListaProgExtraOrd()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_prog_extraOrdinaria", "@data", "0");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaProgExtraOrdParam")]
    public string TraerListaProgExtraOrdParam(string dato)
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_prog_extraOrdinaria", "@data", dato);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("/Home/TraerDatosProgVehiculoAyudas")]
    public string TraerDatosProgVehiculoAyudas()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_buscar_vehiculo_programacion", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("/Home/TraerDatosProgUnidadesAyudas")]
    public string TraerDatosProgUnidadesAyudas()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_buscar_unidad_programacion", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("/Home/TraerDatosProgCIPAyudas")]
    public string TraerDatosProgCIPAyudas()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_buscar_CIP_programacion", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }


}
