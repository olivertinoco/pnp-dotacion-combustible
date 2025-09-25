import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const DataProviderDotacion = ({ children }) => {
  const [data, setData] = useState({
    listaDotacion: [],
    listaVehiculo: [],
    listaOperatividad: [],
    hlpTipoFuncion: [],
    hlpTipoRegistro: [],
    hlpTipoVehiculo: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = "/Home/TraerListaDotacionCombustible";
        // const url = "/Home/TraerListaOperatividadVeh";
        const response = await fetch(url);
        const textData = await response.text();

        if (textData === "error") {
          console.error("Error en el servidor al obtener datos");
          return;
        }
        const [
          dotacionRaw,
          programaRaw,
          operatividadRaw,
          tipoFuncionRaw,
          tipoRegistroRaw,
          tipoVehiculoRaw,
        ] = textData.trim().split("^");

        setData({
          listaDotacion: dotacionRaw?.split("~") ?? [],
          listaVehiculo: programaRaw?.split("~") ?? [],
          listaOperatividad: operatividadRaw?.split("~") ?? [],
          hlpTipoFuncion: tipoFuncionRaw?.split("~") ?? [],
          hlpTipoRegistro: tipoRegistroRaw?.split("~") ?? [],
          hlpTipoVehiculo: tipoVehiculoRaw?.split("~") ?? [],
        });
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };
    fetchData();
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
