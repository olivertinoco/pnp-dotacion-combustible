import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    listaDotacion: [],
    listaVehiculo: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = "/Home/TraerListaDotacionCombustible";
        const response = await fetch(url);
        const textData = await response.text();

        if (textData === "error") {
          console.error("Error en el servidor al obtener datos");
          return;
        }
        const [dotacionRaw, vehiculoRaw] = textData.trim().split("^");
        setData({
          listaDotacion: dotacionRaw?.split("~") ?? [],
          listaVehiculo: vehiculoRaw?.split("~") ?? [],
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
