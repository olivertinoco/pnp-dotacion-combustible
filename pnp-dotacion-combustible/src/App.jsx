import { useState, useTransition } from "react";
import { BaseTabla } from "./components/BaseTabla";
import Loader from "./components/Loader";
import FiltrosGrilla from "./components/FiltrosGrilla";

export default function App() {
  const [activeTab, setActiveTab] = useState("dotacion");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filtrosAplicados, setFiltrosAplicados] = useState(null);
  const [exportExcel, setExportExcel] = useState(false);

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
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "dotacion"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => switchTab("dotacion")}
          >
            Programacion Dotación
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "vehiculo"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => switchTab("vehiculo")}
          >
            Programacion Vehículos
          </button>
        </div>

        <div className="flex gap-2">
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
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white"
            onClick={() => setExportExcel(true)}
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {activeTab === "dotacion" && (
        <BaseTabla
          tipo="dotacion"
          title="Tabla de Dotación de Combustible"
          buscar={filtrosAplicados}
          exportExcel={exportExcel}
          setExportExcel={setExportExcel}
        />
      )}

      {activeTab === "vehiculo" && (
        <BaseTabla
          tipo="vehiculo"
          title="Tabla de Vehículos"
          buscar={filtrosAplicados}
          exportExcel={exportExcel}
          setExportExcel={setExportExcel}
        />
      )}
    </div>
  );
}
