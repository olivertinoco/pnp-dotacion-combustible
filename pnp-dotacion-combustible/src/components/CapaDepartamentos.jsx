import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { featureLayer } from "esri-leaflet";
import { geoJSON } from "leaflet";

export default function CapaDepartamentos({ params, codigo }) {
  const map = useMap();
  const zoomRef = useRef(null);

  useEffect(() => {
    if (!params || !map) return;
    const { url, fillColor, color, weight, datoField } = params;
    const centroPeru = [-9.19, -75.0152];

    if (codigo === null) {
      map.setView(centroPeru, 6);
      zoomRef.current = 6;
      return;
    }

    let whereClause =
      codigo !== "99" ? ` ${datoField} = '${codigo}'` : undefined;

    const capaServicio = featureLayer({
      url,
      ...(whereClause ? { where: whereClause } : {}),
      onEachFeature: function (feature, layer) {
        layer.on("click", (e) => {
          const { lat, lng } = e.latlng;
          console.log("coordenada click:", lat, lng, " zoom: ", map.getZoom());
        });
      },
      style: function () {
        return {
          fillColor,
          color,
          weight,
          opacity: 1,
          fillOpacity: 0.2,
          dashArray: "4,4",
        };
      },
    }).bindPopup(function (layer) {
      const props = layer.feature.properties;
      return `
        <div>
        ${params.label
          .map((l) => `<strong>${l.text}:</strong> ${props[l.nombre]}`)
          .join("<br/>")}
        </div>
      `;
    });

    capaServicio.addTo(map);

    const query = capaServicio.query();
    if (whereClause) query.where(whereClause);

    query.run((error, featureCollection) => {
      if (!error && featureCollection.features.length) {
        const geoJsonLayer = geoJSON(featureCollection);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          if (codigo === "99") {
            map.setView(centroPeru, 6);
            zoomRef.current = 6;
          } else {
            map.fitBounds(bounds);
            let newZoom = map.getZoom();
            if (!zoomRef.current) {
              // primera vez: limitar zoom a 9
              newZoom = newZoom > 9 ? 9 : newZoom;
              zoomRef.current = newZoom;
            } else {
              // subsecuente: mantener el mismo zoom que la primera coincidencia
              newZoom = zoomRef.current;
            }
            map.setView(bounds.getCenter(), newZoom);
          }
        }
      }
    });

    // limpiar al desmontar
    return () => {
      map.removeLayer(capaServicio);
    };
  }, [map, params, codigo]);

  return null;
}
