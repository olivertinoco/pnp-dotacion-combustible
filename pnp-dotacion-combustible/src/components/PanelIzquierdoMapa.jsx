import PanelCard from "./PanelCard";

export default function PanelIzquierdoMapa({
  panelOpen,
  setPanelOpen,
  activePanel,
  setActivePanel,
  data,
  onPanelSelectionChange,
  onBorrarPuntos,
}) {
  return (
    <div
      className={`absolute top-0 left-0 h-full z-[2000] flex flex-col transition-all duration-300`}
      style={{
        width: panelOpen ? "25rem" : "4rem",
        pointerEvents: panelOpen ? "auto" : "none",
      }}
    >
      <div className={`flex-1 space-y-4 p-4 ${!panelOpen ? "hidden" : ""}`}>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setPanelOpen(false)}
            className="bg-green-300 hover:bg-green-400 px-2 py-1 rounded text-sm"
          >
            Cerrar panel
          </button>
          <button
            onClick={() => {
              if (onBorrarPuntos) onBorrarPuntos();
            }}
            className="bg-blue-300 hover:bg-blue-400 px-2 py-1 rounded text-sm"
          >
            Borrar puntos
          </button>
        </div>
        <PanelCard
          title="ruta partida"
          enabled={activePanel === 1}
          onToggle={() => setActivePanel(activePanel === 1 ? null : 1)}
          data={data}
          onSelectionChange={(seleccion) => {
            if (activePanel === 1 && onPanelSelectionChange) {
              onPanelSelectionChange({ panel: 1, ...seleccion });
            }
          }}
        />
        <PanelCard
          title="ruta llegada"
          enabled={activePanel === 2}
          onToggle={() => setActivePanel(activePanel === 2 ? null : 2)}
          data={data}
          onSelectionChange={(seleccion) => {
            if (activePanel === 2 && onPanelSelectionChange) {
              onPanelSelectionChange({ panel: 2, ...seleccion });
            }
          }}
        />
      </div>
    </div>
  );
}
