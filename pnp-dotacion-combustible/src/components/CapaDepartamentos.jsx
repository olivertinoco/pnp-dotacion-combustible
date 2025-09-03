import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { featureLayer } from "esri-leaflet";

export default function CapaDepartamentos({ params, codigo }) {
  const map = useMap();

  useEffect(() => {
    if (!params || !map) return;
    const { url, fillColor, color, weight } = params;

    const capaServicio = featureLayer({
      url,
      ...(codigo ? { where: `DPTO = '${codigo}'` } : {}),
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

    if (codigo) {
      capaServicio.once("load", () => {
        let bounds = null;

        capaServicio.eachFeature((layer) => {
          if (layer.getBounds) {
            const b = layer.getBounds();
            bounds = bounds ? bounds.extend(b) : b;
          }
        });

        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds);
        }
      });
    }

    // limpiar al desmontar
    return () => {
      map.removeLayer(capaServicio);
    };
  }, [map, params, codigo]);

  return null;
}
