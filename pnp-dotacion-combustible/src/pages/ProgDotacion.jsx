import { useLocation } from "react-router-dom";
import { DataProviderDotacion } from "../context/DataProviderDotacion";
import BloqueDotacion from "../components/BloqueDotacion";

export default function ProgDotacion() {
  const location = useLocation();
  const usuario = location.state?.value;

  return (
    <DataProviderDotacion>
      <BloqueDotacion />;
    </DataProviderDotacion>
  );
}
