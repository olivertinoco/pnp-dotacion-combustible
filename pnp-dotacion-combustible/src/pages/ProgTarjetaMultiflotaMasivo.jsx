import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import ExcelUploader from "../components/ExcelUploader";
import { BaseTablaMatriz2 } from "../components/BaseTablaMatriz2";
import { ConfirmDialog } from "../components/ConfirmDialog";
import useLazyFetch from "../hooks/useLazyFetch";
import * as XLSX from "xlsx";

const ProgTarjetaMultiflotaMasivo = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [uploaderKey, setUploaderKey] = useState(Date.now());
  const [resultadoGlobal, setResultadoGlobal] = useState([]);
  const [configTable, setConfigTable] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [observado, setObservado] = useState(false);
  const [procesar, setProcesar] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [disabledExcel, setDisabledExcel] = useState(false);

  useEffect(() => {
    setResultadoGlobal([]);
  }, []);

  const { runFetch } = useLazyFetch();

  const handleExcel = ({ file, arrayBuffer }) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(hoja, { default: "" });
    const headers = Object.keys(rows[0] || {});

    const resultado = [];
    const invalidas = [];
    const contadorNroTarjeta = {};

    rows.forEach((fila, idx) => {
      const pos = idx + 2;
      // const valores = Object.values(fila);
      const valores = headers.map((h) => (fila[h] ?? "").toString().trim());
      const filaUnida = `${pos}|${valores.join("|")}`;
      const invalida = !valores[0] || !valores[2];
      if (invalida) {
        invalidas.push(filaUnida);
        return;
      }

      const nroTarjeta = valores[2];
      if (!contadorNroTarjeta[nroTarjeta]) {
        contadorNroTarjeta[nroTarjeta] = [];
      }
      contadorNroTarjeta[nroTarjeta].push(filaUnida);

      resultado.push(filaUnida);
    });

    const duplicadoTarjeta = Object.values(contadorNroTarjeta)
      .filter((item) => item.length > 1)
      .flat();

    const cabeceras = [
      "Nro|Placa Interna|Placa Rodaje|Nro Tarjeta Multiflota",
      "50|200|200|400",
    ];

    if (invalidas.length > 0) {
      invalidas.unshift(cabeceras);
      setResultadoGlobal(invalidas.flat());
      setObservado(true);
    } else if (duplicadoTarjeta.length > 0) {
      duplicadoTarjeta.unshift(cabeceras);
      setResultadoGlobal(duplicadoTarjeta.flat());
      setObservado(true);
    } else {
      resultado.unshift(cabeceras);
      setResultadoGlobal(resultado.flat());
      setObservado(false);
    }

    setDisabledExcel(true);
  };

  const handleNuevaTarjeta = () => {
    if (resultadoGlobal.length > 0) {
      const titulo = "RESULTADO DE CARGA MASIVA DE TARJETAS MULTIFLOTA:";
      setConfigTable((prev) => ({
        ...prev,
        title: titulo,
        isPaginar: true,
        listaDatos: resultadoGlobal,
        offsetColumnas: 0,
      }));
      setIsEdit(true);
      setProcesar(true);
    } else {
      alert("Debe cargar un archivo para procesar...");
    }
  };

  const handleClickCarga = () => {
    setResultadoGlobal([]);
    setConfigTable((prev) => ({
      ...prev,
      listaDatos: resultadoGlobal,
    }));
    setIsEdit(false);
    setObservado(true);
    setProcesar(false);
    setUploaderKey(Date.now());
    setDisabledExcel(false);
  };

  const handleSubirRegistros = () => {
    setShowConfirm(true);
  };

  const handleClickGuardarMasivo = async () => {
    setIsLoading(true);
    const datosMandar = resultadoGlobal.slice(2).map((item) => {
      const [_, ...datosEnv] = item.split("|");
      return datosEnv.join("|");
    });

    let timmer = 2000;
    const dataEnviarCabecera = datosMandar.join("~");
    const formData = new FormData();
    formData.append("data", dataEnviarCabecera);
    try {
      const result = await runFetch("/Page/GrabarTarjetaMultiflotaMasivo", {
        method: "POST",
        body: formData,
      });

      if (result) {
        setIsLoading(false);
        setMensajeToast("Proceso Terminado satisfactoriamente...");
        setTipoToast("success");
        setIsEdit(true);
        setProcesar(false);

        if (result.trim() !== "ok") {
          if (result.trim().startsWith("error")) {
            setMensajeToast(
              "El archivo excel tiene DUPLICADO DE Nro PLACA INTERNA. Corrija los datos...!!!",
            );
            setTipoToast("warning");
            handleClickCarga();
            timmer = 3000;
          } else {
            const cabeceras = [
              "Nro|Placa Interna|Placa Rodaje|Nro Tarjeta Multiflota|OBSERVACION",
              "50|200|200|400|500",
            ];

            const rpta = result.trim().split("~");
            const dataError = rpta.map((item, idx) => {
              return `${idx + 1}|${item}`;
            });
            const listaRpta = [...cabeceras, ...dataError];
            setConfigTable((prev) => ({
              ...prev,
              listaDatos: listaRpta,
            }));
          }
        } else {
          handleClickCarga();
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      setMensajeToast("Error al guardar la informacion ...");
      setTipoToast("error");
    } finally {
      setTimeout(() => {
        setMensajeToast("");
      }, timmer);
    }
  };

  const emptyFn = useCallback(() => {}, []);

  return (
    <>
      {isLoading && <Loader />}
      <div className="text-xl font-bold mb-4 text-green-800 flex items-center justify-between gap-2">
        <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
          CARGA MASIVA DE LAS TARJETAS MULTIFLOTA :
        </h2>
        <a
          href="/Page/DescargarPlantillaMultiflota"
          className="mt-4 text-sm font-medium text-blue-600 underline hover:text-blue-800 transition"
        >
          DESCARGAR PLANTILLA EXCEL
        </a>
      </div>
      <div className="p-4">
        <ExcelUploader
          key={uploaderKey}
          onFileSelected={handleExcel}
          disabled={disabledExcel}
        />
      </div>
      {mensajeToast && (
        <div
          className={`mt-3 p-3 text-sm rounded-md shadow-md ${
            tipoToast === "success"
              ? "bg-green-700 text-white animate-bounce"
              : tipoToast === "warning"
                ? "bg-yellow-400 text-black animate-bounce"
                : "bg-red-400 text-white animate-bounce"
          }`}
        >
          {mensajeToast}
        </div>
      )}
      <div className="flex justify-end items-center w-full gap-4 mt-8 mb-2">
        <button
          type="button"
          onClick={procesar ? handleSubirRegistros : handleNuevaTarjeta}
          className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-900 transition"
        >
          {procesar ? "PROCESAR" : "MOSTRAR CARGA"}
        </button>
        <button
          type="button"
          onClick={handleClickCarga}
          className="px-4 py-2 rounded-md shadow-sm bg-gray-300 text-black cursor-pointer opacity-50"
        >
          LIMPIAR
        </button>
      </div>
      {showConfirm && (
        <ConfirmDialog
          message="¿Deseas guardar los cambios?"
          onConfirm={() => {
            setShowConfirm(false);
            handleClickGuardarMasivo();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {!isEdit && (
        <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
          Listado con formato XLXS : ( PLACA INTERNA - - PLACA RODAJE - - Nro
          TARJETA )
        </h2>
      )}
      <div className="mb-4 flex-1 min-h-0 overflow-y-auto pr-2">
        {isEdit && (
          <div
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          >
            <BaseTablaMatriz2
              configTable={configTable}
              handleRadioClick={emptyFn}
              handleCheckDelete={emptyFn}
              isEditing={false}
              onSelect={emptyFn}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProgTarjetaMultiflotaMasivo;
