import { useEffect, useState } from "react";
import PanelCard from "./PanelCard";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import mapasBase from "./MapasBase";
import CapaDepartamentos from "./CapaDepartamentos";
import useConstantsMapa from "../hooks/useConstantsMapa";
import PanelIzquierdoMapa from "./PanelIzquierdoMapa";
import useFetch from "../hooks/useFetch";
import CustomButtonControl from "./CustomButtonControl";
import CapaGeometrias from "./CapaGeometrias";

function DisableDoubleClickZoom() {
  const map = useMap();
  useEffect(() => {
    map.doubleClickZoom.disable();
    return () => {
      map.doubleClickZoom.enable();
    };
  }, [map]);
  return null;
}

export default function MapaLeaflet() {
  const { BaseLayer } = LayersControl;
  const position = [-11.4384551, -76.7642199];
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [panelData, setPanelData] = useState(null);

  const [selectedDpto, setSelectedDpto] = useState("99");
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedComisaria, setSelectedComisaria] = useState("");
  const [borrarPuntos, setBorrarPuntos] = useState(false);

  const { departamentos, provincias, distritos, comisarias } =
    useConstantsMapa();

  const { data, loading, error } = useFetch("/Home/TraerListaGeometrias");

  const onBorrarPuntos = () => {
    setBorrarPuntos(true);
  };

  useEffect(() => {
    if (data && data[0] && !panelData) {
      setPanelData(data[0]);
      // debugger;
    }
  }, [data, setPanelData]);

  useEffect(() => {
    const zoomControls = document.querySelectorAll(".leaflet-control-zoom");
    zoomControls.forEach((ctrl) => {
      ctrl.style.display = panelOpen ? "none" : "block";
    });
  }, [panelOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const toggleBtn = document.querySelector(
        ".leaflet-control-layers-toggle",
      );
      if (toggleBtn) {
        toggleBtn.style.backgroundImage = "none";
        toggleBtn.style.display = "flex";
        toggleBtn.style.alignItems = "center";
        toggleBtn.style.justifyContent = "center";
        toggleBtn.style.padding = "0";
        toggleBtn.style.width = "30px";
        toggleBtn.style.height = "30px";
        toggleBtn.style.position = "relative"; // necesario para el ::after
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedDpto) {
      setSelectedProv("");
      setSelectedDist("");
      setSelectedComisaria("");
    }
  }, [selectedDpto]);

  useEffect(() => {
    if (selectedProv) {
      setSelectedDist("");
      setSelectedComisaria("");
    }
  }, [selectedProv]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No hay datos disponibles</div>;

  // console.log(
  //   "Dpto: ",
  //   selectedDpto,
  //   "Prov: ",
  //   selectedProv,
  //   "Dist: ",
  //   selectedDist,
  // );

  // console.log("borrar puntos: ", borrarPuntos);

  return (
    <div className="relative h-screen w-full">
      {/* Panel izquierdo */}
      <div className="absolute top-0 left-0 h-full z-[2000]">
        {panelData && (
          <PanelIzquierdoMapa
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            data={panelData}
            onPanelSelectionChange={(sel) => {
              if ("selectedDpto" in sel) setSelectedDpto(sel.selectedDpto);
              if ("selectedProv" in sel) setSelectedProv(sel.selectedProv);
              if ("selectedDist" in sel) setSelectedDist(sel.selectedDist);
              if ("selectedComisaria" in sel)
                setSelectedComisaria(sel.selectedComisaria);
            }}
            onBorrarPuntos={onBorrarPuntos}
          />
        )}
      </div>

      {/* Mapa */}
      <div className="h-full w-full">
        <MapContainer
          center={position}
          zoom={5.75}
          minZoom={3}
          preferCanvas={true}
          attributionControl={true}
          style={{ height: "100%", width: "100%" }}
          doubleClickZoom={false}
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
          <DisableDoubleClickZoom />
          {data.slice(1).map((geo, idx) => (
            <CapaGeometrias key={idx} geoJsonStringify={geo.split("~")} />
          ))}

          {selectedDpto && (
            <CapaDepartamentos
              params={departamentos}
              codigo={selectedDpto}
              borrarPuntos={borrarPuntos}
              setBorrarPuntos={setBorrarPuntos}
            />
          )}
          {selectedProv && (
            <CapaDepartamentos
              params={provincias}
              codigo={selectedProv}
              borrarPuntos={borrarPuntos}
              setBorrarPuntos={setBorrarPuntos}
            />
          )}
          {selectedDist && (
            <CapaDepartamentos
              params={distritos}
              codigo={selectedDist}
              borrarPuntos={borrarPuntos}
              setBorrarPuntos={setBorrarPuntos}
            />
          )}
          {selectedComisaria && (
            <CapaDepartamentos
              params={comisarias}
              codigo={selectedComisaria}
              borrarPuntos={borrarPuntos}
              setBorrarPuntos={setBorrarPuntos}
            />
          )}

          <CustomButtonControl
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
          />
        </MapContainer>
      </div>
    </div>
  );
}
