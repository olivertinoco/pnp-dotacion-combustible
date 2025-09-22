import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { geoJSON, circle, marker, divIcon } from "leaflet";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { renderToString } from "react-dom/server";

const heroIconMarker = divIcon({
  className: "",
  html: renderToString(
    <MapPinIcon className="w-8 h-8 text-red-600 drop-shadow-lg" />,
  ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function CapaGeometrias({ geoJsonStringify }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonStringify || geoJsonStringify.length < 2) return;
    const [color, grosor, tipo] = geoJsonStringify[0].split("|");

    // Iterar desde el índice 1 en adelante
    const layers = geoJsonStringify.slice(1).map((geoStr) => {
      try {
        const [_, jsonStr] = geoStr.split("|");
        if (!jsonStr) return null;

        const geoObj = JSON.parse(jsonStr);

        const geoLayer = geoJSON(geoObj, {
          style: {
            color: color,
            weight: grosor,
            fillOpacity: 0.1,
          },
          pointToLayer: (feature, latlng) => {
            if (tipo === undefined) return null;
            if (tipo === "1") {
              return circle(latlng, {
                radius: 80,
                color: color,
                opacity: 0.75,
                weight: grosor,
                fillColor: color,
                fillOpacity: 0.25,
                bubblingMouseEvents: false,
              });
            } else {
              return marker(latlng, { icon: heroIconMarker });
            }
          },
        });

        geoLayer.addTo(map);
        return geoLayer;
      } catch {
        return null;
      }
    });

    return () => {
      layers.forEach((l) => l && map.removeLayer(l));
    };
  }, [geoJsonStringify, map]);

  return null;
}
