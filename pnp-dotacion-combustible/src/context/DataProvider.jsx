import { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const login = async (usuario, clave) => {
    try {
      const formData = new FormData();
      formData.append("data1", usuario);
      formData.append("data2", clave);

      const response = await fetch("/Home/TraerListaMenus", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setError(`Error HTTP: ${response.status}`);
        setData([]);
        return { ok: false, error: `Error HTTP: ${response.status}` };
      }

      const textData = await response.text();

      if (textData === "warning") {
        setError("Usuario o clave incorrecto");
        setData([]);
        return { ok: false, error: "Usuario o clave incorrecto" };
      }
      if (textData === "error") {
        setError("Servidor fuera de linea");
        setData([]);
        return { ok: false, error: "Servidor fuera de linea" };
      }

      const rows = textData.trim().split("~");
      setError(null);
      setData(rows);
      return { ok: true, data: rows };
    } catch (err) {
      console.error("Error en DataProvider:", err);
      setError("Error en el provider");
      return { ok: false, error: "Error en el provider" };
    }
  };

  return (
    <DataContext.Provider value={{ data, error, login }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
