import { useState, useEffect } from "react";

let cache = {};

export const clearFetchCache = () => {
  cache = {};
};

const useFetch = (url) => {
  const [data, setData] = useState(cache[url] || null);
  const [loading, setLoading] = useState(!cache[url]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache[url]) {
      setData(cache[url]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        if (cancelled) return;
        const rows = text.trim().split("^");
        cache[url] = rows;
        setData(rows);
      })
      .catch((error) => {
        console.error("Error en fetch:", error);
        if (!cancelled) setError(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return { data, loading, error };
};

export default useFetch;
