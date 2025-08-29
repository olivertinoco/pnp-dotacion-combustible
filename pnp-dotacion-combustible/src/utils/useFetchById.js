import { useEffect, useState } from "react";

export function useFetchById(url, idCabecera) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idCabecera) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("idCabecera", idCabecera);

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const textData = await response.text();
        setData(textData);
        setError(null);
      } catch (err) {
        console.error("Error en useFetchById:", err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, idCabecera]);

  return { data, loading, error };
}
