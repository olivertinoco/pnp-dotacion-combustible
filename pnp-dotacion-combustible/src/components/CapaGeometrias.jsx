import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { layerGroup, geoJSON } from "leaflet";

export default function CapaGeometrias({ geoJsonStringify }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJsonStringify || geoJsonStringify.length < 2) return;

    const [color, grosor] = geoJsonStringify[0].split("|");

    // Grupo contenedor
    const group = layerGroup();

    // Iterar desde el índice 1 en adelante
    geoJsonStringify.slice(1).forEach((geoStr, idx) => {
      try {
        const [idStr, jsonStr] = geoStr.split("|");
        if (!jsonStr) return;

        const geoObj = JSON.parse(jsonStr);

        if (geoObj?.features) {
          geoObj.features = geoObj.features.map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              id: idStr,
            },
          }));
        }

        const geoLayer = geoJSON(geoObj, {
          style: {
            color: color,
            weight: grosor,
            fillOpacity: 0.1,
          },
          onEachFeature: (feature, layer) => {
            const { id, NOMBRE } = feature.properties || {};
            layer.bindPopup(
              NOMBRE
                ? `Nombre: ${NOMBRE}<br/>ID: ${id}`
                : `Feature ${idx + 1}<br/>ID: ${id}`,
            );
          },
        });

        group.addLayer(geoLayer);
      } catch (err) {
        console.error("Error al parsear geojson:", geoStr, err);
      }
    });

    // Añadimos el grupo al mapa
    group.addTo(map);

    // Limpiamos cuando cambie la dependencia o se desmonte
    return () => {
      map.removeLayer(group);
    };
  }, [geoJsonStringify, map]);

  return null;
}
