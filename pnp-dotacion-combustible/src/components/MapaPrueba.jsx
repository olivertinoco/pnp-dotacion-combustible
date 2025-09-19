import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import { Squares2X2Icon, MapPinIcon } from "@heroicons/react/24/solid";

// 👇 componente que desactiva el zoom con doble click
function DisableDoubleClickZoom() {
  const map = useMap();

  useEffect(() => {
    map.doubleClickZoom.disable();
    console.log("✅ doubleClickZoom deshabilitado");
  }, [map]);

  return null;
}

// 👇 componente que escucha el doble click para agregar marcador
function MarkerHandler({ onAddMarker }) {
  useMapEvents({
    dblclick(e) {
      console.log("📍 doble click en:", e.latlng);
      onAddMarker(e.latlng);
    },
  });
  return null;
}

export default function MapaPrueba() {
  const [markers, setMarkers] = useState([]);
  const position = [-11.4384551, -76.7642199];

  const handleAddMarker = (latlng) => {
    setMarkers((prev) => [...prev, latlng]);
  };

  const heroIconMarker = divIcon({
    className: "", // sin clases de Leaflet por defecto
    html: renderToString(
      <MapPinIcon className="w-8 h-8 text-red-600 drop-shadow-lg" />,
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 32], // centro inferior
  });

  const mapasBase = {
    "Google Streets": {
      url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      options: {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "Google",
      },
    },
  };

  return (
    <MapContainer
      center={position}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url={mapasBase["Google Streets"].url}
        {...mapasBase["Google Streets"].options}
      />
      <DisableDoubleClickZoom />
      <MarkerHandler onAddMarker={handleAddMarker} />

      {markers.map((pos, i) => (
        <Marker key={i} position={[pos.lat, pos.lng]} icon={heroIconMarker}>
          <Popup>
            Marcador #{i + 1} <br />
            {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
