import { useLocation } from "react-router-dom";

const PageBase = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  return (
    <label className="flex flex-col gap-2 mb-4">
      <span className="font-normal">CARGA MASIVA POLICIAL 02 </span>
      <p>Este es el usuario: {usuario}</p>
      <input
        className="w-full py-3 px-2 rounded-lg bg-slate-400"
        type="text"
        placeholder="saludo de datos ..."
      />
    </label>
  );
};

export default PageBase;
