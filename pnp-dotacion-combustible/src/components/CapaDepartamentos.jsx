import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { featureLayer } from "esri-leaflet";
import { geoJSON } from "leaflet";

export default function CapaDepartamentos({ params, codigo }) {
  const map = useMap();
  const cacheRef = useRef(null); // guardamos el FeatureCollection completo
  const zoomRef = useRef(null);

  // efecto 1: traer datos solo una vez
  useEffect(() => {
    if (!params || !map) return;
    if (cacheRef.current) return; // ya tenemos cache

    const { url } = params;
    const capaServicio = featureLayer({ url });

    const query = capaServicio.query();
    query.run((error, featureCollection) => {
      if (!error && featureCollection.features.length) {
        cacheRef.current = featureCollection; // guardamos en memoria
        renderLocal(codigo, params, featureCollection);
      }
    });
  }, [map, params]);

  // efecto 2: filtrar localmente cuando cambia "codigo"
  useEffect(() => {
    if (!params || !map) return;
    if (cacheRef.current) {
      renderLocal(codigo, params, cacheRef.current);
    }
  }, [codigo, params, map]);

  function renderLocal(codigo, params, featureCollection) {
    const { fillColor, color, weight, datoField, tipo } = params;
    const centroPeru = [-9.19, -75.0152];

    // limpiar capas previas
    map.eachLayer((layer) => {
      if (layer.feature) {
        map.removeLayer(layer);
      }
    });

    if (codigo === null) {
      map.setView(centroPeru, 6);
      zoomRef.current = 6;
      return;
    }

    // filtro local
    const filtered = {
      ...featureCollection,
      features:
        codigo && codigo !== "99"
          ? featureCollection.features.filter(
              (f) => f.properties[datoField] === codigo,
            )
          : featureCollection.features,
    };

    const geoJsonLayer = geoJSON(filtered, {
      onEachFeature: (feature, layer) => {
        layer.on("click", (e) => {
          const { lat, lng } = e.latlng;
          console.log("coordenada click:", lat, lng, " zoom: ", map.getZoom());
        });
        layer.bindPopup(`
          <div>
            ${params.label
              .map(
                (l) =>
                  `<strong>${l.text}:</strong> ${feature.properties[l.nombre]}`,
              )
              .join("<br/>")}
          </div>
        `);
      },
      style: () => ({
        fillColor,
        color,
        weight,
        opacity: 1,
        fillOpacity: 0.2,
        dashArray: "4,4",
      }),
    }).addTo(map);

    // ajuste de vista siempre que cambie el código
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      if (codigo === "99") {
        map.setView(centroPeru, 6);
        zoomRef.current = 6;
      } else {
        map.fitBounds(bounds);

        switch (tipo) {
          case "prov":
            map.setZoom(10);
            zoomRef.current = 10;
            break;
          case "dist":
            map.setZoom(12);
            zoomRef.current = 12;
            break;
          case "dpto":
          default:
            zoomRef.current = map.getZoom();
            break;
        }
      }
    }
  }

  return null;
}
