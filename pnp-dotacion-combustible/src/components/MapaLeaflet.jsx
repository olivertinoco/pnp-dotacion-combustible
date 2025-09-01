import { useState } from "react";
import PanelCard from "./PanelCard";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import mapasBase from "./MapasBase";

const { BaseLayer } = LayersControl;

export default function MapaLeaflet() {
  const position = [-11.4384551, -76.7642199];
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="flex h-screen w-full">
      {/* Panel izquierdo */}
      <div
        className={`transition-all duration-300 ease-in-out bg-gray-100 shadow p-4`}
        style={{
          width: panelOpen ? "25rem" : "4rem", // ancho panel expandido vs colapsado
        }}
        onMouseEnter={() => setPanelOpen(true)}
        onMouseLeave={() => setPanelOpen(false)}
      >
        <div className="flex flex-col space-y-4">
          {panelOpen && (
            <div className="space-y-4">
              <PanelCard title="ruta partida" />
              <PanelCard title="ruta llegada" />
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <MapContainer
          center={position}
          zoom={5.75}
          minZoom={3}
          preferCanvas={true}
          attributionControl={true}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            {Object.entries(mapasBase).map(([nombre, cfg], i) => {
              const { url, options = {}, type } = cfg;
              return (
                <BaseLayer key={nombre} name={nombre} checked={i === 0}>
                  {type === "wms" ? (
                    <WMSTileLayer url={url} {...options} />
                  ) : (
                    <TileLayer url={url} {...options} />
                  )}
                </BaseLayer>
              );
            })}
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
}
