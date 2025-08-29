import { useLocation } from "react-router-dom";
import { useFetchById } from "../utils/useFetchById";

export default function SubRQpersonal() {
  const location = useLocation();
  const cabecera = location.state?.value;
  const { data, loading, error } = useFetchById(
    "/Home/TraerDetalleSubmenu",
    cabecera,
  );

  return (
    <div>
      <h1>Página de Postulante ID: {cabecera} </h1>
      <p>
        Esta es la vista que corresponde a tu action `Menu()` en el controller.
      </p>
    </div>
  );
}
