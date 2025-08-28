const BannerBotons = ({ bannerConfig }) => {
  const {
    activeTab,
    mostrarFiltros,
    switchTab,
    setMostrarFiltros,
    setFiltrosAplicados,
    setExportExcel,
  } = bannerConfig;
  return (
    <div className="flex justify-between mb-4">
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "vehiculo" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchTab("vehiculo")}
        >
          Programacion Vehículos
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "dotacion" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => switchTab("dotacion")}
        >
          Programacion Dotación
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
          {activeTab === "dotacion"
            ? "Exp. Excel Dotación"
            : "Exp. Excel Vehículo"}
        </button>
      </div>
    </div>
  );
};
export default BannerBotons;
