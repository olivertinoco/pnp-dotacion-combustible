import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import useValidationFields from "../hooks/useValidationFields";
import { useSelectStore } from "../store/selectStore";
import CustomElement from "../components/CustomElement";
import { BaseTablaMatriz2 } from "../components/BaseTablaMatriz2";

const ProgExtraordinariaSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = location.state?.value;
  const elementosRef = useRef([]);
  const [datasets, setDatasets] = useState({});
  const [popupContent, setPopupContent] = useState(false);
  const [configTable, setConfigTable] = useState({});

  const API_RESULT_LISTAR = "/Home/Busqueda_prog_ord_extra";
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();

  const validacion = useValidationFields(elementosRef);
  const { handleClick, mensajeError, esValido, valoresCambiados } = validacion;

  const preData = typeof data?.[0] === "string" ? data?.[0]?.split("~") : [];
  const info = preData?.[0]?.split("|") ?? [];
  const infoMeta = preData?.[1]?.split("|") ?? [];

  const informacion = (infoMeta ?? []).map((meta, idx) => ({
    data: (info ?? [])[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

  const listasData = (data ?? []).slice(1);
  const mapaListas = useMemo(() => {
    return (listasData ?? []).reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});
  }, [listasData]);

  const handlePopup = () => {
    console.log("handlePopup");
  };

  const handlePopupClose = () => {
    console.log("handlePopupClose");
  };

  const handleChange = (e) => {
    const { value, valor, campo, item } = e.target.dataset;
    setDatasets((prev) => ({
      ...prev,
      [item]: { value, valor, item },
    }));
  };

  const llenarCombos = (valor) => {
    const lista = mapaListas?.[valor] ?? [];
    return lista;
  };

  const handleEnvio = useCallback(async () => {
    const nuevosData = [...valoresCambiados.data];
    const nuevosCampos = [...valoresCambiados.campos];
    const posiciones = {};
    const resultado = [];
    ["400.1", "400.2", "400.3", "400.4", "400.5"].forEach((clave) => {
      posiciones[clave] = "";
    });

    nuevosCampos.forEach((campo, idx) => {
      if (Object.hasOwn(posiciones, campo)) {
        posiciones[campo] = nuevosData[idx];
      }
    });

    Object.keys(posiciones)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((clave) => {
        resultado.push(posiciones[clave].trim());
      });

    const fechaIni = resultado[3];
    const fechaFin = resultado[4];
    if (fechaIni !== "" && fechaFin !== "") {
      const ini = new Date(fechaIni);
      const fin = new Date(fechaFin);
      if (isNaN(ini) || isNaN(fin)) {
        alert("Formato de fecha inválido");
        return;
      }
      if (ini > fin) {
        alert("La fecha inicial no puede ser mayor que la fecha final.");
        return;
      }
    }
    if (fechaIni === "" && fechaFin !== "") {
      alert("No puede ingresar fecha final sin fecha inicial");
      return;
    }

    if (resultado.slice(1).join("|") === "|||") {
      alert("Debe ingresar un dato a buscar");
      return;
    }
    const datosBuscar = resultado.join("|");

    // console.log("Data Enviar:", datosBuscar);

    const formData = new FormData();
    formData.append("data", datosBuscar);
    try {
      const result = await runFetch("/Home/Busqueda_listar_datos_prog_extra", {
        method: "POST",
        body: formData,
      });

      if (result && result.trim() !== "") {
        const filteredOptionsProp = result.split("~");

        if (filteredOptionsProp.length === 2) {
          setConfigTable((prev) => ({
            ...prev,
            listasData: [],
          }));
          setPopupContent(false);
          useSelectStore.setState({ selectedItems: [] });
          alert("NO SE ENCONTRO INFORMACION");
          return;
        }

        setConfigTable({
          title: "Encontrados de Programación Ordinaria - Extraordinaria :",
          isPaginar: false,
          listaDatos: filteredOptionsProp,
          offsetColumnas: 1,
          hash: "",
        });
        setPopupContent(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [valoresCambiados, runFetch]);

  useEffect(() => {
    if (esValido) {
      handleEnvio();
    }
  }, [esValido, handleEnvio]);

  const handleNuevo = () => {
    useSelectStore.setState({ selectedItems: [] });
    navigate("/prog-extra-ord-base");
  };

  const handleFilaSeleccionada = (fila) => {
    const { setSelectedItems } = useSelectStore.getState();
    fila.push(usuario);
    setSelectedItems([fila]);
    navigate("/prog-extra-ord-base");
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <>
      <h1 className="p-2 text-2xl font-bold text-green-800">
        Busqueda de Programación Ordinaria - Extraordinaria
      </h1>
      <div className="max-w-[50vw] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {informacion.map((datos, idx) => {
            const { data, metadata } = datos;
            const typeCode = Number(metadata?.[5] ?? 0);
            let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
            const isRequired = metadata?.[1] === "0";
            const isDisabled = metadata?.[8] === "1";
            const hideElement = metadata?.[14] === "1";
            maxLength = metadata?.[4] === "" ? maxLength : Number(metadata[4]);

            const colSpanMap = {
              "-1": "w-1/2",
              1: "col-span-1",
              2: "col-span-2",
              3: "col-span-3",
              4: "col-span-4",
            };

            return (
              <div
                key={idx}
                className={`${colSpanMap[metadata?.[10]] ?? "col-span-1"} min-w-0`}
              >
                <CustomElement
                  ref={(el) => {
                    if (el) {
                      elementosRef.current[metadata[6]] = el;
                    }
                  }}
                  typeCode={typeCode}
                  etiqueta={metadata[7] ?? ""}
                  placeholder={metadata[7] ?? ""}
                  popupTipo={metadata[6] ?? ""}
                  onPopupClick={() => handlePopup(metadata[6])}
                  onPopupClose={(accion, valor) =>
                    handlePopupClose(accion, valor, metadata[6])
                  }
                  style={
                    hideElement
                      ? {
                          visibility: "hidden",
                          position: "absolute",
                          width: 0,
                          height: 0,
                          overflow: "hidden",
                        }
                      : {}
                  }
                  {...(maxLength > 0 ? { maxLength } : {})}
                  {...(isDisabled ? { disabled: true } : {})}
                  {...(isRequired ? { required: true } : {})}
                  {...(typeCode === 103
                    ? {
                        checked: (datasets[metadata[0]]?.value ?? data) === "1",
                      }
                    : {})}
                  {...(metadata?.[2] === "1" && typeCode === 101
                    ? { tipoDato: "entero" }
                    : {})}
                  {...(metadata?.[2] === "2" && typeCode === 101
                    ? { tipoDato: "decimal" }
                    : {})}
                  {...(typeCode === 111
                    ? {
                        defaultValue:
                          mapaListas[metadata[6]]?.length > 0
                            ? datos.metadata[0]
                            : "",
                        ...(metadata?.[11] === "1" ? { isDefault: 1 } : {}),
                      }
                    : typeCode === 151
                      ? {
                          defaultValue: datos.data,
                          unaLinea: metadata?.[11],
                          offsetColumnas: metadata?.[12],
                          ancho: metadata?.[13],
                        }
                      : {
                          defaultValue: datos.data,
                        })}
                  dataAttrs={{
                    value: datasets[metadata[6]]?.value ?? data,
                    valor: data,
                    campo: metadata[0],
                    item: metadata[6],
                  }}
                  onChange={handleChange}
                  {...(mapaListas[metadata[6]] ||
                  datasets[metadata[0]]?.listaAux
                    ? {
                        options: (() => {
                          const base = llenarCombos(metadata[6]) || [];
                          const auxRaw = datasets[metadata[0]]?.listaAux;
                          const auxArr = Array.isArray(auxRaw)
                            ? auxRaw.filter((v) => v && v.trim() !== "")
                            : [];
                          return base.concat(auxArr);
                        })(),
                      }
                    : {})}
                />
              </div>
            );
          })}
        </div>
      </div>
      <h2 className="p-2 mt-4 text-lg font-medium text-green-700 mb-4 border-b border-green-300 pb-1 flex justify-between items-center">
        <span>Búsqueda de programación ordinaria - extraordinaria</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClick}
            className="bg-green-700 text-white px-3 py-1 rounded-md hover:bg-green-900 transition"
          >
            BUSCAR
          </button>
          <button
            type="button"
            onClick={handleNuevo}
            className="bg-green-700 text-white px-3 py-1 rounded-md hover:bg-green-900 transition"
          >
            NUEVO
          </button>
        </div>
      </h2>
      <div className="mb-4 flex-1 min-h-0 overflow-y-auto pr-2">
        {popupContent && (
          <div
            style={{
              maxHeight: "50vh",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          >
            <BaseTablaMatriz2
              configTable={configTable}
              handleRadioClick={() => {}}
              handleCheckDelete={() => {}}
              isEditing={false}
              onSelect={handleFilaSeleccionada}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProgExtraordinariaSearch;
