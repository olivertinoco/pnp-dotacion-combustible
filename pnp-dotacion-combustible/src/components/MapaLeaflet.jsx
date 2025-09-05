import { useState, useEffect } from "react";
import PanelCard from "./PanelCard";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import mapasBase from "./MapasBase";
import CapaDepartamentos from "./CapaDepartamentos";
import useConstantsMapa from "../hooks/useConstantsMapa";
import { useStreamFetch } from "../hooks/useStreamFetch";

const { BaseLayer } = LayersControl;

export default function MapaLeaflet() {
  const position = [-11.4384551, -76.7642199];
  const [panelOpen, setPanelOpen] = useState(false);
  const { departamento } = useConstantsMapa();

  const { data, loading, error, progress } = useStreamFetch(
    "/Home/TraerListaGeometrias",
  );

  useEffect(() => {
    if (data) {
      console.log("🔍 data recibido:", data);
    }
  }, [data]);

  let geoJsonData = null;
  try {
    if (data) {
      geoJsonData = JSON.parse(data); // parse al terminar
    }
  } catch (err) {
    console.error("Error parseando GeoJSON:", err);
  }

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

          <CapaDepartamentos params={departamento} codigo={null} />

          {loading && (
            <div className="absolute top-2 left-2 bg-white p-2 rounded shadow">
              Cargando {progress}%
            </div>
          )}
          {error && (
            <div className="absolute top-2 left-2 bg-red-200 text-red-800 p-2 rounded shadow">
              Error: {error}
            </div>
          )}
          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              style={() => ({
                color: "red",
                weight: 3,
              })}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
