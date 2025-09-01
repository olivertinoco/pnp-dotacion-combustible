import { useLocation } from "react-router-dom";
import MapaLeaflet from "../components/MapaLeaflet";

export default function ProgExtraordinaria() {
  const location = useLocation();
  const cabecera = location.state?.value;

  return <MapaLeaflet />;
}
