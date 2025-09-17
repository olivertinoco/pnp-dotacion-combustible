import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { featureLayer, query } from "esri-leaflet";
import { geoJSON, marker, circle, divIcon } from "leaflet";

export default function CapaDepartamentos({ params, codigo }) {
  const map = useMap();
  const cacheRef = useRef(null); // guardamos el FeatureCollection completo
  const zoomRef = useRef(null);
  const layerRef = useRef(null);

  // efecto 1: traer datos solo una vez(departamentos/provincias)
  useEffect(() => {
    if (!params || !map) return;
    if (params.tipo === "dist" || params.tipo === "comi") return;
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

  // efecto 2: filtrar localmente cuando cambia "codigo" -- siempre viaja a demanda
  useEffect(() => {
    if (!params || !map) return;
    if (params.tipo === "dist" || params.tipo === "comi") {
      // distritos: query directo al server
      if (!codigo) {
        renderLocal(null, params, null);
        return;
      }
      const { url, datoField } = params;
      const q = query({ url });
      q.where(`${datoField} = '${codigo}'`).run((error, featureCollection) => {
        if (!error) {
          renderLocal(codigo, params, featureCollection);
        }
      });
    } else {
      // dpto/prov: cache local
      if (cacheRef.current) {
        renderLocal(codigo, params, cacheRef.current);
      }
    }
  }, [codigo, params, map]);

  function renderLocal(codigo, params, featureCollection) {
    const { fillColor, color, weight, datoField, tipo } = params;
    const centroPeru = [-9.19, -75.0152];

    // limpiar capas previas
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (codigo === null) {
      map.setView(centroPeru, 6);
      zoomRef.current = 6;
      return;
    }

    // filtro local
    const filtered =
      tipo === "dist" || tipo === "comi"
        ? {
            ...featureCollection,
            features: featureCollection.features.map((f) => ({
              ...f,
              properties: { ...f.properties, fillColor, color, weight },
            })),
          }
        : {
            ...featureCollection,
            features:
              codigo && codigo !== "99"
                ? featureCollection.features.filter(
                    (f) => f.properties[datoField] === codigo,
                  )
                : featureCollection.features,
          };

    if (!filtered || !filtered.features || filtered.features.length === 0)
      return;

    const geoJsonLayer = geoJSON(filtered, {
      pointToLayer: (feature, latlng) => {
        if (feature.geometry?.type !== "Point") {
          return null;
        }
        if (!latlng || isNaN(latlng.lat) || isNaN(latlng.lng)) {
          console.warn("Coordenadas inválidas en feature", feature);
          return;
        }
        if (feature.properties?.TIPO !== "capital") {
          return marker(latlng, {
            icon: divIcon({
              className: "",
              html: `
              <svg height="32px" width="32px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          	 viewBox="0 0 512 512" xml:space="preserve">
              <g>
             	<path style="fill:#5C6887;" d="M256,459.034l-52.966-114.759L83.2,361.393c-1.386,0.203-2.322-1.377-1.483-2.489L158.897,256
              		l-77.18-102.903c-0.839-1.112,0.097-2.692,1.483-2.489l119.834,17.117L256,52.966l52.966,114.759L428.8,150.607
              		c1.386-0.203,2.322,1.377,1.483,2.489L353.103,256l77.18,102.903c0.839,1.112-0.097,2.692-1.483,2.489l-119.835-17.117L256,459.034
              		z"/>
             	<g>
              		<path style="fill:#3D4763;" d="M282.483,26.483c0,14.627-11.855,26.483-26.483,26.483c-14.627,0-26.483-11.855-26.483-26.483
             			S241.373,0,256,0C270.627,0,282.483,11.855,282.483,26.483"/>
              		<path style="fill:#3D4763;" d="M476.69,132.414c0,14.627-11.855,26.483-26.483,26.483c-14.627,0-26.483-11.855-26.483-26.483
             			s11.855-26.483,26.483-26.483C464.834,105.931,476.69,117.786,476.69,132.414"/>
              		<path style="fill:#3D4763;" d="M476.69,379.586c0,14.627-11.855,26.483-26.483,26.483c-14.627,0-26.483-11.855-26.483-26.483
             			s11.855-26.483,26.483-26.483C464.834,353.103,476.69,364.959,476.69,379.586"/>
              		<path style="fill:#3D4763;" d="M88.276,379.586c0,14.627-11.855,26.483-26.483,26.483S35.31,394.214,35.31,379.586
             			s11.855-26.483,26.483-26.483S88.276,364.959,88.276,379.586"/>
              		<path style="fill:#3D4763;" d="M88.276,132.414c0,14.627-11.855,26.483-26.483,26.483S35.31,147.041,35.31,132.414
             			s11.855-26.483,26.483-26.483S88.276,117.786,88.276,132.414"/>
              		<path style="fill:#3D4763;" d="M282.483,485.517C282.483,500.145,270.627,512,256,512c-14.627,0-26.483-11.855-26.483-26.483
             			s11.855-26.483,26.483-26.483C270.627,459.034,282.483,470.89,282.483,485.517"/>
              		<path style="fill:#3D4763;" d="M317.793,256c0,34.127-27.666,61.793-61.793,61.793S194.207,290.127,194.207,256
             			s27.666-61.793,61.793-61.793S317.793,221.873,317.793,256"/>
             	</g>
             	<path style="fill:#F0C419;" d="M288.724,240.931c-3.452-3.452-9.031-3.452-12.482,0l-11.414,11.414l-11.414-11.414
              		c-3.452-3.452-9.031-3.452-12.482,0l-17.655,17.655c-3.452,3.452-3.452,9.031,0,12.482c1.721,1.721,3.981,2.586,6.241,2.586
              		c2.26,0,4.52-0.865,6.241-2.586l11.414-11.414l11.414,11.414c1.721,1.721,3.981,2.586,6.241,2.586c2.26,0,4.52-0.865,6.241-2.586
              		l17.655-17.655C292.175,249.962,292.175,244.383,288.724,240.931"/>
                  </g>
              </svg>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            }),
          });
        } else {
          return circle(latlng, {
            radius: 200,
            color,
            opacity: 0.75,
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.25,
            bubblingMouseEvents: false,
          }).on("click", (e) => {
            console.log("Círculo clickeado", feature);
          });
        }
      },
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
      style: (feature) => {
        if (feature.geometry?.type !== "Point") {
          return {
            fillColor: feature.properties?.fillColor || fillColor,
            color: feature.properties?.color || color,
            weight: feature.properties?.weight || weight,
            opacity: 1,
            fillOpacity: 0.2,
            dashArray: "4,4",
          };
        }
      },
    }).addTo(map);

    layerRef.current = geoJsonLayer;

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
          case "comi":
            map.setZoom(15);
            zoomRef.current = 15;
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
