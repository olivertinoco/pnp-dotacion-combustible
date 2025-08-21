import { useState, useEffect } from "react";
import { useData } from "../context/DataProvider";

const FiltrosGrilla = ({ visible = false, onBuscar }) => {
  const { hlpTipoFuncion, hlpTipoRegistro, hlpTipoVehiculo } = useData();

  const [tipoRegistro, setTipoRegistro] = useState("");
  const [tipoFuncion, setTipoFuncion] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [placaInterna, setPlacaInterna] = useState("");

  useEffect(() => {
    if (visible) {
      setTipoRegistro("");
      setTipoFuncion("");
      setTipoVehiculo("");
      setPlacaInterna("");
    }
  }, [visible]);

  const handleBuscar = () => {
    if (onBuscar) {
      onBuscar({
        tipoRegistro,
        tipoFuncion,
        tipoVehiculo,
        placaInterna,
      });
    }
  };

  return (
    <div
      className={`border border-gray-300 rounded-lg p-4 ${
        visible ? "block" : "hidden"
      }`}
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Filtros de Búsqueda
      </h2>
      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Tipo de Registro
          </label>
          <select
            className="border border-gray-300 w-full px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 h-11"
            value={tipoRegistro}
            onChange={(e) => setTipoRegistro(e.target.value)}
          >
            <option value="">TODOS</option>
            {hlpTipoRegistro.map((op) => {
              const [valor, text] = op.split("|");
              return (
                <option key={valor} value={valor}>
                  {text}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Tipo de Función
          </label>
          <select
            className="border border-gray-300 w-full px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 h-11"
            value={tipoFuncion}
            onChange={(e) => setTipoFuncion(e.target.value)}
          >
            <option value="">TODOS</option>
            {hlpTipoFuncion.map((op) => {
              const [valor, text] = op.split("|");
              return (
                <option key={valor} value={valor}>
                  {text}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Tipo de Vehículo
          </label>
          <select
            className="border border-gray-300 w-full px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 h-11"
            value={tipoVehiculo}
            onChange={(e) => setTipoVehiculo(e.target.value)}
          >
            <option value="">TODOS</option>
            {hlpTipoVehiculo.map((op) => {
              const [valor, text] = op.split("|");
              return (
                <option key={valor} value={valor}>
                  {text}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">
            Placa Interna
          </label>
          <input
            className="border border-gray-300 w-full px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 invalid:focus:ring-red-400 solo-enteros h-11"
            type="text"
            maxLength="10"
            placeholder="Busqueda por placa interna..."
            autoComplete="off"
            value={placaInterna}
            onChange={(e) => setPlacaInterna(e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white font-semibold px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-11"
              onClick={handleBuscar}
            >
              Buscar
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition h-11"
              onClick={() => {
                setTipoRegistro("");
                setTipoFuncion("");
                setTipoVehiculo("");
                setPlacaInterna("");
                if (onBuscar) {
                  onBuscar({
                    tipoRegistro: "",
                    tipoFuncion: "",
                    tipoVehiculo: "",
                    placaInterna: "",
                  });
                }
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosGrilla;
