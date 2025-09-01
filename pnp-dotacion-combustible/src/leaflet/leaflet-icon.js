import L from "leaflet";
import layersIcon from "../assets/icons/layers-icon.svg"; // tu SVG local

// Sobrescribe solo el icono de layers-toggle
const DefaultControlLayersIcon = layersIcon;

// Seleccionamos el estilo global de Leaflet para toggle
const style = document.createElement("style");
style.innerHTML = `
.leaflet-control-layers-toggle {
  background-image: url(${DefaultControlLayersIcon}) !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}
`;
document.head.appendChild(style);
