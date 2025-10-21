import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import useValidationFields from "../hooks/useValidationFields";
import CustomElement from "../components/CustomElement";
import { useSelectStore } from "../store/selectStore";

const ProgExtraordinaria = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [datasets, setDatasets] = useState({});
  const elementosRef = useRef([]);
  const inputRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");
  const [refreshKey, setRefreshKey] = useState(0);
  const [datoModelos, setDatoModelos] = useState("");
  const [closeChild, setCloseChild] = useState(false);
  const closeChildRef = useRef(closeChild);

  const API_RESULT_LISTAR = "/Home/TraerListaProgExtraOrd";

  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();

  const { handleClick, mensajeError, esValido, valoresCambiados } =
    useValidationFields(elementosRef);

  useEffect(() => {
    closeChildRef.current = closeChild;
  }, [closeChild]);

  useEffect(() => {
    const hidden100 = elementosRef.current.find(
      (el) => el?.type === "hidden" && el.dataset.value?.trim() !== "",
    );
    if (hidden100) {
      setIsEdit(true);
    }
  }, []);

  const listaAuxRef = useRef("");
  const handleBuscarClick = async () => {
    listaAuxRef.current = "";
    if (inputRef.current) {
      const valorParametro = `zz|${inputRef.current.value}`;
      const result = await runFetch(
        `${API_RESULT_LISTAR}Param?dato=${encodeURIComponent(valorParametro)}`,
        {
          method: "GET",
          headers: {
            Accept: "text/plain",
            "Content-Type": "text/plain",
          },
        },
      );

      // const preData = result.split("~");
      const preData = typeof result === "string" ? result.split("~") : [];
      const info = preData?.[0]?.split("|") ?? [];
      const infoMeta = preData?.[1]?.split("|") ?? [];

      if (
        !result ||
        result.trim() === "" ||
        !info.length ||
        info[0].trim() === ""
      ) {
        setDatasets({});

        try {
          const { setSelectedItems } = useSelectStore.getState();
          setSelectedItems([]);
        } catch (err) {
          console.warn("No se pudo limpiar Zustand:", err);
        }

        elementosRef.current.forEach((el) => {
          if (!el) return;
          if (
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.tagName === "SELECT"
          ) {
            if (el.type === "checkbox" || el.type === "radio") {
              el.checked = false;
            } else {
              el.value = "";
            }
            el.dataset.value = "";
            el.dataset.valor = "";
          }
          if (el && el.tagName === "SELECT") {
            while (el.options.length > 0) {
              el.remove(0);
            }
            setRefreshKey((k) => k + 1);
          }
        });

        Object.keys(mapaListas).forEach((key) => (mapaListas[key] = []));
        setIsEdit(false);
        return;
      }
      listaAuxRef.current = info?.[1] + "|" + info?.[info.length - 1];

      const informacion = infoMeta.map((meta, idx) => ({
        data: info[idx] ?? "",
        metadata: (meta ?? "").split("*"),
      }));

      const campo100 = informacion.find((item) => item.metadata?.[5] === "100");
      if (campo100) {
        const campo = campo100.metadata[0];
        const valor = campo100.data;

        if (valor && valor.trim() !== "") {
          const hidden100 = elementosRef.current.find(
            (el) => el?.type === "hidden" && el.dataset.campo === campo,
          );
          if (hidden100) {
            hidden100.value = valor;
            hidden100.dataset.value = valor;
          }
          setIsEdit(true);
        }
      }

      informacion
        .filter((item) => item.metadata?.[5] !== "100")
        .forEach((item) => {
          const campo = item.metadata[0];
          const valor = item.data;
          const el = elementosRef.current.find(
            (ref) => ref?.dataset?.campo === campo,
          );
          if (el) {
            if (
              el.tagName === "INPUT" ||
              el.tagName === "TEXTAREA" ||
              el.tagName === "SELECT"
            ) {
              el.value = valor;
              el.dataset.value = valor;
              el.dataset.valor = valor;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              setDatasets((prev) => ({
                ...prev,
                [campo]: { value: valor, valor: valor, item: item ?? "" },
              }));

              const typeCode = item.metadata?.[5];
              const popupTipo = item.metadata?.[6];
              if (
                typeCode === "151" &&
                popupTipo === "0" &&
                listaAuxRef.current !== ""
              ) {
                const partes = listaAuxRef.current.split("|");
                const listaFormateada =
                  partes.length > 1 ? [`${partes[0]}|${partes[1]}`] : [];
                setDatasets((prev) => ({
                  ...prev,
                  [campo]: {
                    ...(prev[campo] ?? {}),
                    listaAux: listaFormateada,
                  },
                }));
              }
            }
          }
        });
    }
  };

  const handleEnvio = useCallback(async () => {
    if (!valoresCambiados.data.length && !valoresCambiados.campos.length) {
      setMensajeToast("NO existen datos que enviar");
      setTipoToast("error");
      setTimeout(() => setMensajeToast(""), 2000);
      return;
    }

    const hidden100 = elementosRef.current.find(
      (el) => el?.type === "hidden" && el.dataset.campo,
    );
    if (hidden100) {
      valoresCambiados.campos.unshift(hidden100.dataset.campo);
      valoresCambiados.data.unshift(hidden100.dataset.value);
    }
    const dataEnviar =
      usuario.trim() +
      "~" +
      valoresCambiados.data.join("|") +
      "|" +
      valoresCambiados.campos.join("|");

    const formData = new FormData();
    formData.append("data", dataEnviar);

    console.log("Datos a Enviar Datos:", dataEnviar);

    setIsSubmitting(true);
    try {
      const result = await runFetch("/Home/GrabarDatosVarios", {
        method: "POST",
        body: formData,
      });

      if (result) {
        setMensajeToast("Datos Guardados Correctamente ...");
        setTipoToast("success");
        setIsEdit(true);

        console.log("Respuesta Grabacion Datos Datos:", result);
        if (hidden100 && result.trim() !== "") {
          hidden100.value = result.trim();
          hidden100.dataset.value = result.trim();
        }

        elementosRef.current.forEach((el) => {
          if (!el) return;
          el.dataset.valor = el.dataset.value ?? "";
        });
      }
    } catch (err) {
      console.error(err);
      setMensajeToast("Error al guardar la informacion ...");
      setTipoToast("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMensajeToast("");
      }, 2000);
    }
  }, [valoresCambiados, usuario, runFetch]);

  useEffect(() => {
    if (esValido) {
      handleEnvio();
    }
  }, [esValido, handleEnvio]);

  const preData = typeof data?.[0] === "string" ? data?.[0]?.split("~") : [];
  const info = preData?.[0]?.split("|") ?? [];
  const infoMeta = preData?.[1]?.split("|") ?? [];
  const infoTitleGrupo = preData?.[2]?.split("|") ?? [];

  const informacionAux = (infoMeta ?? []).map((meta, idx) => ({
    data: (info ?? [])[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

  // NOTA: AGRUPAMOS Y REORDENAMOS ANTES DE PINTAR:
  //   =============================================
  const informacion = informacionAux
    .map((item) => {
      const metadata = [...(item.metadata ?? [])];
      const raw = metadata[9];
      if (raw && raw.includes("+")) {
        const [parteIzquierda, parteDerecha] = raw.split("+");
        metadata[9] = parteIzquierda;
        return { ...item, metadata, _orden: Number(parteDerecha) || 0 };
      }
      return { ...item, metadata, _orden: 0 };
    })
    .sort((a, b) => a._orden - b._orden)
    .map(({ _orden, ...rest }) => rest);

  const listasData = (data ?? []).slice(1);

  const mapaListas = (listasData ?? []).reduce((acc, entry) => {
    const [itemKey, ...opciones] = entry.split("~");
    acc[itemKey] = opciones;
    return acc;
  }, {});

  const grupos = infoTitleGrupo
    .map((titulo) => {
      const [id, nombre] = titulo.split("*");
      return { id, nombre };
    })
    .filter((g) => g.id !== undefined);

  const agrupado = grupos.map((grupo) => ({
    ...grupo,
    items: informacion.filter((item) => item.metadata[9] === grupo.id),
  }));

  // NOTA: PARA VISUALIZAR LOS DATOS DEL HIDDENFIELD
  // ===============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      const valores = Object.values(elementosRef.current);
      if (!valores.length) return;
      valores.forEach((el) => {
        if (el?.type === "hidden") {
          console.log(
            `Hidden encontrado: campo=${el.dataset?.campo}, item=${el.dataset?.item}, value=${el.dataset?.value}`,
          );
        }
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [agrupado, refreshKey]);
  // ===============================================

  useEffect(() => {
    elementosRef.current = elementosRef.current.filter((el) => el !== null);
  }, [agrupado]);

  const handleChange = (e) => {
    const { value, valor, campo, item } = e.target.dataset;

    setDatasets((prev) => ({
      ...prev,
      [campo]: { value, valor, item },
    }));
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: id_vehiculo{error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  const llenarCombos = (valor, campo, value) => {
    const lista = mapaListas?.[valor] ?? [];
    return lista;
  };

  const handlePopup = (item) => {};

  const handlePopupClose = (accion, valor, item) => {
    const { selectedItems } = useSelectStore.getState();
    if (!selectedItems || selectedItems.length === 0) return;
    const elementoSeleccionado = selectedItems[0];
    console.log("zustand:", elementoSeleccionado);

    if (item === "990") {
      setTimeout(() => {
        const camposActualizar = [
          { item: "11", indice: 2 },
          { item: "12", indice: 3 },
          { item: "990", indice: 6 },
          { item: "7", indice: 7 },
          { item: "1", indice: 4 },
          { item: "2", indice: 5 },
        ];

        setDatasets((prev) => {
          const nuevo = { ...prev };
          camposActualizar.forEach(({ item, indice }) => {
            const el = elementosRef.current[item];
            if (!el) return;
            const valor = elementoSeleccionado[indice] ?? "";
            el.value = valor;
            el.dataset.value = valor;

            if (el.tagName === "SELECT" && el.options.length > 0) {
              const opt = el.options[0];
              opt.textContent = valor;
              opt.value = valor;
            }
            el.dispatchEvent(new Event("input", { bubbles: true }));
            nuevo[item] = {
              value: valor,
              item: el.dataset.item ?? "",
            };
          });
          return nuevo;
        });

        const { setSelectedItems } = useSelectStore.getState();
        setSelectedItems([]);
      }, 50);
    }
  };

  const urlMap = {
    990: "/Home/TraerDatosProgVehiculoAyudas",
    991: "/Home/TraerDatosProgUnidadesAyudas",
    992: "/Home/TraerDatosProgCIPAyudas",
  };

  return (
    <>
      <div className="text-xl font-bold mb-4 text-green-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            ref={inputRef}
            placeholder="Buscar..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            type="button"
            onClick={handleBuscarClick}
            className="px-4 py-1 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-md transition-colors"
          >
            Buscar
          </button>
        </div>
        <span className="text-green-800">{isEdit ? "EDITAR" : "NUEVO"}</span>
      </div>

      {agrupado.map(
        (grupo) =>
          grupo.items.length > 0 && (
            <div key={grupo.id} className="mb-8">
              <h2 className="text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
                {grupo.nombre}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {grupo.items.map((datos) => {
                  const idx = informacion.findIndex(
                    (item) => item.metadata[0] === datos.metadata[0],
                  );
                  const { data, metadata } = datos;
                  const typeCode = Number(metadata?.[5] ?? 0);
                  let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
                  const isRequired = metadata?.[1] === "0";
                  const isDisabled = metadata?.[8] === "1";
                  const hideElement = metadata?.[13] === "1";
                  maxLength =
                    metadata?.[4] === "" ? maxLength : Number(metadata[4]);

                  return (
                    <CustomElement
                      key={`${idx}-${refreshKey}`}
                      ref={(el) => {
                        if (el) elementosRef.current[metadata[6]] = el;
                      }}
                      typeCode={typeCode}
                      etiqueta={metadata[7] ?? ""}
                      placeholder={metadata[7] ?? ""}
                      popupTipo={metadata[6] ?? ""}
                      url={urlMap[metadata[6]] ?? ""}
                      onPopupClick={() => handlePopup(metadata[0])}
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
                            checked:
                              (datasets[metadata[0]]?.value ?? data) === "1",
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
                            ...(metadata?.[10] === "1" ? { isDefault: 1 } : {}),
                          }
                        : typeCode === 151
                          ? {
                              defaultValue: datos.data,
                              unaLinea: metadata?.[10],
                              offsetColumnas: metadata?.[11],
                              ancho: metadata?.[12],
                              isFilter:
                                metadata[0] === "1.11" ? datoModelos : "",
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
                              const base =
                                llenarCombos(metadata[6], metadata[0], data) ||
                                [];
                              const auxRaw = datasets[metadata[0]]?.listaAux;
                              const auxArr = Array.isArray(auxRaw)
                                ? auxRaw.filter((v) => v && v.trim() !== "")
                                : [];
                              return base.concat(auxArr);
                            })(),
                          }
                        : {})}
                    />
                  );
                })}
              </div>
            </div>
          ),
      )}

      <div className="mt-8 mb-2">
        <CustomElement
          typeCode={120}
          onClick={() => handleClick()}
          {...(isSubmitting ? { disabled: true } : {})}
        >
          {isSubmitting ? "Guardando..." : "GUARDAR"}
        </CustomElement>
        {mensajeError && (
          <div className="mt-3 p-3 text-sm text-white bg-red-400 rounded-md shadow-md animate-bounce">
            {mensajeError}
          </div>
        )}
        {mensajeToast && (
          <div
            className={`mt-3 p-3 text-sm rounded-md shadow-md ${
              tipoToast === "success"
                ? "bg-green-700 text-white animate-bounce"
                : "bg-red-400 text-white animate-bounce"
            }`}
          >
            listaFormateada
            {mensajeToast}
          </div>
        )}
      </div>
    </>
  );
};

export default ProgExtraordinaria;
