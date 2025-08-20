import { useState, useTransition } from "react";
import { BaseTabla } from "./components/BaseTabla";
import Loader from "./components/Loader";
import FiltrosGrilla from "./components/FiltrosGrilla";

export default function App() {
  const [activeTab, setActiveTab] = useState("dotacion");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);

  const switchTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const manejarBuscar = (valores) => {
    setFiltrosAplicados(valores);
  };

  return (
    <div className="p-5 relative">
      <FiltrosGrilla visible={mostrarFiltros} onBuscar={manejarBuscar} />
      {isPending && <Loader />}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "dotacion" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchTab("dotacion")}
        >
          Programacion Dotación
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "vehiculo" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchTab("vehiculo")}
        >
          Programacion Vehículos
        </button>
        <button
          className={`px-4 py-2 rounded bg-blue-500 text-white`}
          onClick={() => {
            setMostrarFiltros((prev) => {
              const nuevoValor = !prev;
              if (nuevoValor) {
                setFiltrosAplicados(null);
              }
              return nuevoValor;
            });
          }}
        >
          {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>

      {activeTab === "dotacion" && (
        <BaseTabla tipo="dotacion" title="Tabla de Dotación de Combustible" />
      )}

      {activeTab === "vehiculo" && (
        <BaseTabla tipo="vehiculo" title="Tabla de Vehículos" />
      )}

      {/* ESTE PUNTO ES SOLO PARA PRUEBAS:
      ================================*/}
      {filtrosAplicados && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="font-bold">Filtros aplicados:</h3>
          <pre>{JSON.stringify(filtrosAplicados, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
