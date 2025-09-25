import { useState, useTransition } from "react";
import { BaseTabla } from "./BaseTabla";
import { BaseTabla2 } from "./BaseTabla2";
import Loader from "./Loader";
import FiltrosGrilla from "./FiltrosGrilla";
import BannerBotons from "./BannerBotons";

const BloqueDotacion = () => {
  const [activeTab, setActiveTab] = useState("operativo");
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

  const bannerConfig = {
    activeTab,
    mostrarFiltros,
    switchTab,
    setMostrarFiltros,
    setFiltrosAplicados,
    setExportExcel,
  };

  const configTable = {
    tipo: activeTab,
    title:
      activeTab === "vehiculo"
        ? "Tabla de Vehículos"
        : activeTab === "dotacion"
          ? "Tabla de Dotación de Combustible"
          : "Tabla de Operatividad Vehicular",
    buscar: filtrosAplicados,
    exportExcel,
    setExportExcel,
    isPaginar: true,
  };

  return (
    <div className="p-5 relative">
      <FiltrosGrilla
        visible={activeTab !== "operativo" && mostrarFiltros}
        onBuscar={manejarBuscar}
      />
      {isPending && <Loader />}
      <BannerBotons bannerConfig={bannerConfig} />
      {activeTab === "operativo" && <BaseTabla2 configTable={configTable} />}
      {activeTab === "vehiculo" && <BaseTabla2 configTable={configTable} />}
      {activeTab === "dotacion" && <BaseTabla2 configTable={configTable} />}
    </div>
  );
};

export default BloqueDotacion;
