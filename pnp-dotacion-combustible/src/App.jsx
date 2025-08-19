import { useState, useTransition } from "react";
import { BaseTabla } from "./components/BaseTabla";
import Loader from "./components/Loader";

export default function App() {
  const [activeTab, setActiveTab] = useState("dotacion");
  const [isPending, startTransition] = useTransition();

  const switchTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <div className="p-5 relative">
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
      </div>

      {activeTab === "dotacion" && (
        <BaseTabla tipo="dotacion" title="Tabla de Dotación de Combustible" />
      )}

      {activeTab === "vehiculo" && (
        <BaseTabla tipo="vehiculo" title="Tabla de Vehículos" />
      )}
    </div>
  );
}
