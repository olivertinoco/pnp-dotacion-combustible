import { useState, useEffect } from "react";

export function useStreamFetch(url) {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // % completado (si viene content-length)

  useEffect(() => {
    if (!url) return;

    let isCancelled = false;

    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      setData("");
      setProgress(0);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : null;

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let receivedLength = 0;
        let chunks = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedLength += value.length;
          const chunk = decoder.decode(value, { stream: true });
          chunks += chunk;

          if (total && !isCancelled) {
            setProgress(Math.round((receivedLength / total) * 100));
          }
        }

        // Final flush
        chunks += decoder.decode();
        if (!isCancelled) {
          try {
            const parsed = JSON.parse(chunks);
            setData(parsed);
            setProgress(100);
          } catch (parseErr) {
            setError("GeoJSON inválido", parseErr);
          }
        }
      } catch (err) {
        if (!isCancelled) setError(err.message);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchStream();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return { data, loading, error, progress };
}
