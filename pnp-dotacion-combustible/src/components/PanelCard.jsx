import { useState, useEffect, useMemo } from "react";

export default function PanelCard({
  title,
  enabled,
  onToggle,
  data,
  onSelectionChange,
}) {
  const [dataDpto, setDataDpto] = useState([]);
  const [dataProv, setDataProv] = useState([]);
  const [dataDist, setDataDist] = useState([]);

  const [selectedDpto, setSelectedDpto] = useState("");
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedComisaria, setSelectedComisaria] = useState("");

  useEffect(() => {
    if (!data) return;
    const datos = data.split("~");
    const dataDpto = Array.from(
      datos.reduce((acc, item) => {
        const [codigo, departamento] = item.split("|");
        const clave = `${codigo.slice(0, 2)}|${departamento}`;
        acc.add(clave);
        return acc;
      }, new Set()),
    ).sort((a, b) => {
      const depA = a.split("|")[1];
      const depB = b.split("|")[1];
      return depA.localeCompare(depB);
    });

    const dataProv = Array.from(
      datos.reduce((acc, item) => {
        const [codigo, , provincia] = item.split("|");
        if (provincia && provincia.trim() !== "") {
          const clave = `${codigo.slice(0, 4)}|${provincia}`;
          acc.add(clave);
        }
        return acc;
      }, new Set()),
    ).sort((a, b) => {
      const [codA, provA] = a.split("|");
      const [codB, provB] = b.split("|");

      const depA = codA.slice(0, 2);
      const depB = codB.slice(0, 2);

      if (depA === depB) {
        return provA.localeCompare(provB);
      }
      return depA.localeCompare(depB);
    });

    const dataDist = Array.from(
      datos.reduce((acc, item) => {
        const [codigo, , , distrito] = item.split("|");
        if (distrito && distrito.trim() !== "") {
          const clave = `${codigo}|${distrito}`;
          acc.add(clave);
        }
        return acc;
      }, new Set()),
    ).sort((a, b) => {
      const [codA, distA] = a.split("|");
      const [codB, distB] = b.split("|");

      const provCodA = codA.slice(0, 4);
      const provCodB = codB.slice(0, 4);

      if (provCodA === provCodB) {
        return distA.localeCompare(distB);
      }
      return provCodA.localeCompare(provCodB);
    });

    setDataDpto(dataDpto);
    setDataProv(dataProv);
    setDataDist(dataDist);
  }, [data]);

  const filteredProv = useMemo(() => {
    if (!selectedDpto) return [];
    return dataProv.filter((item) => {
      const [codigo] = item.split("|");
      return codigo.startsWith(selectedDpto);
    });
  }, [dataProv, selectedDpto]);

  const filteredDist = useMemo(() => {
    if (!selectedProv) return [];
    return dataDist.filter((item) => {
      const [codigo] = item.split("|");
      return codigo.startsWith(selectedProv);
    });
  }, [dataDist, selectedProv]);

  useEffect(() => {
    if (!selectedDist) {
      setSelectedComisaria("");
    } else {
      setSelectedComisaria(selectedDist);
    }
  }, [selectedDist]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        selectedDpto,
        selectedProv,
        selectedDist,
        selectedComisaria,
      });
    }
  }, [
    selectedDpto,
    selectedProv,
    selectedDist,
    selectedComisaria,
    onSelectionChange,
  ]);

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>

        {/* Switch */}
        <button
          type="button"
          onClick={onToggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Contenedor de labels e inputs */}
      <div
        className={`space-y-4 ${!enabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Selecciona Departamento:
          </span>
          <select
            className="w-full border rounded p-2 mt-1"
            disabled={!enabled}
            value={selectedDpto}
            onChange={(e) => {
              setSelectedDpto(e.target.value);
              setSelectedProv("");
              setSelectedDist("");
              setSelectedComisaria("");
            }}
          >
            <option value="">Seleccione...</option>
            {dataDpto.map((dptos, index) => {
              const [codigo, departamento] = dptos.split("|");
              return (
                <option key={index} value={codigo}>
                  {departamento}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Selecciona Provincia:
          </span>
          <select
            className="w-full border rounded p-2 mt-1"
            disabled={!enabled || !selectedDpto}
            value={selectedProv}
            onChange={(e) => {
              setSelectedProv(e.target.value);
              setSelectedDist("");
              setSelectedComisaria("");
            }}
          >
            <option value="">Seleccione...</option>
            {filteredProv.map((prov) => {
              const [codigo, provincia] = prov.split("|");
              return (
                <option key={codigo} value={codigo}>
                  {provincia}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Selecciona Distrito:
          </span>
          <select
            className="w-full border rounded p-2 mt-1"
            disabled={!enabled || !selectedProv}
            value={selectedDist}
            onChange={(e) => {
              setSelectedDist(e.target.value);
            }}
          >
            <option value="">Seleccione...</option>
            {filteredDist.map((dist) => {
              const [codigo, distrito] = dist.split("|");
              return (
                <option key={codigo} value={codigo}>
                  {distrito}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Escribe algo:
          </span>
          <input
            type="text"
            placeholder="Escribe algo..."
            className="w-full border rounded p-2 mt-1"
            disabled={!enabled}
          />
        </label>
      </div>
    </div>
  );
}
