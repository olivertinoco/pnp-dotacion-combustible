export default function useConstantsMapa() {
  const url =
    "https://giserver.proviasnac.gob.pe/arcgis/rest/services/PROVIAS/WEB_LimitesPoliticos/MapServer";
  const urlPol =
    "https://seguridadciudadana.mininter.gob.pe/arcgis/rest/services/servicios_ogc/policia_nacional_peru/MapServer";

  const comisarias = {
    url: `${urlPol}/5`,
    tipo: "comi",
    fillColor: "#007bff",
    color: "#007bff",
    weight: 2,
    datoField: "id_dist",
    label: [
      { text: "Comisaria", nombre: "comisaria" },
      { text: "Region Policial", nombre: "regionpol" },
      { text: "Division Policial", nombre: "divpol_divopus" },
    ],
  };

  const departamentos = {
    url: `${url}/0`,
    tipo: "dpto",
    // fillColor: "#007bff",
    fillOpacity: 0,
    color: "#007bff",
    weight: 2,
    datoField: "DPTO",
    label: [
      { text: "Departamento", nombre: "NOMBRE" },
      { text: "Capital", nombre: "CAPITAL" },
    ],
  };

  const provincias = {
    url: `${url}/1`,
    tipo: "prov",
    // fillColor: "#aa91b2",
    fillOpacity: 0,
    color: "#008000",
    weight: 1.5,
    datoField: "CODIGO",
    label: [
      { text: "Provincia", nombre: "NOMBRE" },
      { text: "Capital", nombre: "CAPITAL" },
    ],
  };

  const distritos = {
    url: `${url}/2`,
    tipo: "dist",
    // fillColor: "#0080af",
    fillOpacity: 0,
    color: "#ff0000",
    weight: 1,
    datoField: "CODIGO",
    label: [
      { text: "Distrito", nombre: "NOMBRE" },
      { text: "Capital", nombre: "CAPITAL" },
    ],
  };

  return { comisarias, departamentos, provincias, distritos };
}
