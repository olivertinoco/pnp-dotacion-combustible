import { useLocation } from "react-router-dom";

export default function ProgExtraordinaria() {
  const location = useLocation();
  const cabecera = location.state?.value;

  return (
    <div>
      <h1>Página de Postulante ID: {cabecera} </h1>
      <p>
        Esta es la vista que corresponde a tu action `Menu()` en el controller.
      </p>
    </div>
  );
}
