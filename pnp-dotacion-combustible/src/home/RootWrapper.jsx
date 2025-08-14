import { useEffect } from "react";
import "../index.css";
import App from "../App";

export default function RootWrapper() {
  useEffect(() => {
    const onDomReady = () => {
      console.log("DOM listo (no espera imágenes)");
    };
    const onPageLoad = () => {
      console.log("Página lista (espera imágenes y CSS)");
    };

    // Manejo de DOMContentLoaded (puede ya estar listo)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDomReady);
    } else {
      onDomReady();
    }

    // Manejo del evento load
    window.addEventListener("load", onPageLoad);

    // Limpieza al desmontar
    return () => {
      document.removeEventListener("DOMContentLoaded", onDomReady);
      window.removeEventListener("load", onPageLoad);
    };
  }, []);

  return <App />;
  // return (
  //   <>
  //     <App />
  //     <App />
  //   </>
  // );
}
