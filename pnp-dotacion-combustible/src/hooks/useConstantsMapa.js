export default function useConstantsMapa() {
  const url =
    "https://giserver.proviasnac.gob.pe/arcgis/rest/services/PROVIAS/WEB_LimitesPoliticos/MapServer";
  const urlPol =
    "https://seguridadciudadana.mininter.gob.pe/arcgis/rest/services/servicios_ogc/policia_nacional_peru/MapServer";

  const comisarias = {
    url: `${urlPol}/5`,
    capa: 0,
    fillColor: "#007bff",
    color: "#007bff",
    weight: 2,
    datoField: "",
    label: [
      { text: "Comisaria", nombre: "comisaria" },
      { text: "Region Policial", nombre: "regionpol" },
      { text: "Division Policial", nombre: "divpol_divopus" },
    ],
  };

  const departamento = {
    url: `${url}/0`,
    capa: 0,
    fillColor: "#007bff",
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
    capa: 1,
    fillColor: "#ffffff",
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
    capa: 2,
    fillColor: "#ffffff",
    color: "#a52a2a",
    weight: 1,
    datoField: "CODIGO",
    label: [
      { text: "Distrito", nombre: "NOMBRE" },
      { text: "Capital", nombre: "CAPITAL" },
    ],
  };

  return { comisarias, departamento, provincias, distritos };
}
