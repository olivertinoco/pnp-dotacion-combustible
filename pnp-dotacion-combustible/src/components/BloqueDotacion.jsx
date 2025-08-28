import { useState, useTransition } from "react";
import { BaseTabla } from "./BaseTabla";
import Loader from "./Loader";
import FiltrosGrilla from "./FiltrosGrilla";
import BannerBotons from "./BannerBotons";

const BloqueDotacion = () => {
  const [activeTab, setActiveTab] = useState("vehiculo");
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
        : "Tabla de Dotación de Combustible",
    buscar: filtrosAplicados,
    exportExcel,
    setExportExcel,
    isPaginar: true,
  };

  return (
    <div className="p-5 relative">
      <FiltrosGrilla visible={mostrarFiltros} onBuscar={manejarBuscar} />
      {isPending && <Loader />}
      <BannerBotons bannerConfig={bannerConfig} />
      {activeTab === "vehiculo" && <BaseTabla configTable={configTable} />}
      {activeTab === "dotacion" && <BaseTabla configTable={configTable} />}
    </div>
  );
};

export default BloqueDotacion;
