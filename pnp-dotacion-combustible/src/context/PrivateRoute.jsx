import { Navigate } from "react-router-dom";
import { useData } from "./DataProvider";

export default function PrivateRoute({ children }) {
  const { data } = useData();
  // o valida con token/usuario
  const isLoggedIn = data && data.length > 0;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
