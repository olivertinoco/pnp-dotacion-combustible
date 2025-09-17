import { useMapEvent } from "react-leaflet";

export default function MapClickHandler({ setPanelOpen }) {
  useMapEvent("click", () => setPanelOpen(false));
  return null;
}
