import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSelectStore } from "../store/selectStore";
import CustomElement from "../components/CustomElement";
import { BaseTablaMatriz2 } from "../components/BaseTablaMatriz2";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import useValidationFields from "../hooks/useValidationFields";
import { useMenuTrigger } from "../context/MenuTriggerContext";

const ProgTarjetaMultiflota = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [datasets, setDatasets] = useState({});
  const [forcedOption, setForcedOption] = useState({});
  const [optionFlag, setOptionFlag] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [configTable, setConfigTable] = useState({});
  const [idVehiculo, setIdVehiculo] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");
  const [showNewTarjeta, setShowNewTarjeta] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const elementosRef = useRef([]);

  const API_RESULT_LISTAR = "/Home/TraerTarjetaMultiflota";
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();

  const validacion = useValidationFields(elementosRef);
  const { handleClick, mensajeError, esValido, valoresCambiados } = validacion;
  const { menuTrigger } = useMenuTrigger();

  const limpiarEstadoInicial = () => {
    setDatasets({});
    setForcedOption({});
    setOptionFlag({});
    setIsEdit(false);
    setConfigTable({});
    setIdVehiculo("");
    setShowConfirm(false);
    setMensajeToast("");
    setTipoToast("success");
    setShowNewTarjeta(false);

    elementosRef.current.forEach((el) => {
      if (!el) return;
      el.value = "";
      el.dataset.value = "";
      el.dataset.valor = "";
      if (el.type === "checkbox") el.checked = false;
    });

    const items = ["990", "991"];
    items.forEach((item) => {
      setRefreshKey((k) => k + 1);
      const el = elementosRef.current
        .filter(Boolean)
        .find((el) => el.dataset.item === item);
      if (el && el.tagName === "SELECT") {
        setForcedOption((prev) => ({
          ...prev,
          [item]: {
            value: "",
            label: "",
          },
        }));
        setOptionFlag((prev) => ({
          ...prev,
          [item]: 0,
        }));
      }
    });
    elementosRef.current = [];
    useSelectStore.setState({ selectedItems: [] });
  };

  useEffect(() => {
    limpiarEstadoInicial();
  }, [menuTrigger]);

  const handleBuscarClick = async (parametro) => {
    const valorParametro = `zz|${parametro}`;
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

    if (result.startsWith("error")) {
      console.warn("error");
      return;
    }

    const preData = typeof result === "string" ? result.split("~") : [];
    const info = preData?.[0]?.split("|") ?? [];
    const infoMeta = preData?.[1]?.split("|") ?? [];
    const dataAyudas = preData?.slice(3)?.join("~");

    if (info.length === 1) {
      setTimeout(() => {
        elementosRef.current.forEach((el) => {
          if (el && el.dataset) {
            el.dataset.valor = "";
          }
        });
      }, 100);
      setIsEdit(false);
    }

    const informacion = infoMeta.map((meta, idx) => ({
      data: info[idx] ?? "",
      metadata: (meta ?? "").split("*"),
    }));

    const datoTarjeta = [
      { item: "2", index: 4 },
      { item: "3", index: 5 },
      { item: "4", index: 6 },
    ];
    datoTarjeta.forEach(({ item, index }) => {
      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el?.dataset.item === item);
      const raw = informacion[index]?.data;
      const valor = String(raw ?? "").trim();
      if (!elemento) return;
      elemento.dataset.value = valor;
      elemento.value = valor;
    });

    setTimeout(() => {
      const raw = informacion[7]?.data;
      const valor = String(raw ?? "").trim();
      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el?.dataset.item === "5");
      if (elemento.tagName === "INPUT" && elemento.type === "checkbox") {
        const esChecked = valor === "1";
        elemento.dataset.value = esChecked ? "1" : "0";
        elemento.checked = esChecked;
      }
    }, 100);

    informacion
      .filter((item) => item.metadata?.[5] === "100")
      .forEach((item) => {
        const campo = item.metadata[0];
        const valor = item.data;

        if (valor && valor.trim() !== "") {
          elementosRef.current.forEach((el) => {
            if (el?.type === "hidden" && el.dataset.campo === campo) {
              el.value = valor;
              el.dataset.value = valor;
            }
          });
          setIsEdit(true);
        }
      });

    if (dataAyudas) {
      const ayudasData = dataAyudas.split("~");
      if (ayudasData.length === 2) return;

      setConfigTable((prev) => ({
        ...prev,
        title: "HISTORIAL DE CAMBIOS DE TARJETAS MULTIFLOTA:",
        isPaginar: false,
        listaDatos: ayudasData,
        offsetColumnas: 0,
      }));
    }
    setTimeout(() => {
      elementosRef.current.forEach((el) => {
        if (el && el.dataset) {
          el.dataset.valor = el.dataset.value;
        }
      });
    }, 100);
  };

  useEffect(() => {
    handleBuscarClick(idVehiculo);
  }, [idVehiculo]);

  const handleEnvio = useCallback(async () => {
    const nuevosData = [...valoresCambiados.data];
    const nuevosCampos = [...valoresCambiados.campos];
    const setHidden = new Set();
    let dataEnviarCabecera = "";

    if (!nuevosData.length && !nuevosCampos.length) {
      setMensajeToast("NO existen datos que enviar");
      setTipoToast("error");
      setTimeout(() => setMensajeToast(""), 2000);
      return;
    }

    const hiddenElements = elementosRef.current
      .filter(Boolean)
      .filter((el) => el?.type === "hidden");

    hiddenElements.forEach((el) => {
      const campo = el.dataset.campo ?? "";
      const value = el.dataset.value ?? "";
      setHidden.add(JSON.stringify({ campo, value }));
    });

    setHidden.forEach((item) => {
      const { campo, value } = JSON.parse(item);
      nuevosCampos.unshift(campo);
      nuevosData.unshift(value);
    });

    const nroTarjetaMultipago = nuevosData?.[2] ?? "";
    const nroTarjetaDuplicado = configTable.listaDatos
      .slice(2)
      .filter((item) => {
        const dato = item.split("|");
        return String(dato[0] ?? "").trim() === nroTarjetaMultipago;
      });

    if (nroTarjetaDuplicado && nroTarjetaDuplicado.length > 0) {
      setMensajeToast(
        "No se permite Nro Tarjeta Duplicado, por favor verifique ...",
      );
      setTipoToast("warning");
      setTimeout(() => {
        setMensajeToast("");
      }, 3000);
      return;
    }

    dataEnviarCabecera =
      usuario.trim() +
      "~" +
      nuevosData.join("|") +
      "|" +
      nuevosCampos.join("|");

    const formData = new FormData();
    formData.append("data", dataEnviarCabecera);
    try {
      const result = await runFetch("/Home/GrabarTarjetaMultiflota", {
        method: "POST",
        body: formData,
      });

      if (result) {
        if (result.trim().startsWith("duplicado")) {
          setMensajeToast(
            "El nro de Tarjeta ya existe, por favor verifique ...",
          );
          setTipoToast("warning");
          setIsEdit(true);
          setTimeout(() => {
            setMensajeToast("");
          }, 3000);
          return;
        }

        setMensajeToast("Datos Guardados Correctamente ...");
        setTipoToast("success");
        setIsEdit(true);

        if (result.trim() !== "") {
          const rpta = result.trim().split("^");
          const elPK = elementosRef.current
            .filter(Boolean)
            .find((el) => el?.dataset?.item === "10");
          elPK.dataset.value = rpta?.[0];
          if (rpta.length > 1) {
            const arregloDetalle = rpta.slice(1).flatMap((p) => p.split("~"));
            const primerReg = arregloDetalle[2].split("|");
            if (primerReg[2].trim() !== "") {
              setShowNewTarjeta(true);
            } else {
              setShowNewTarjeta(false);
            }

            setConfigTable((prev) => ({
              ...prev,
              listaDatos: arregloDetalle,
            }));
          }
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

  const mapaListas = useMemo(() => {
    return (listasData ?? []).reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});
  }, [listasData]);

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

  const handlePopup = () => {
    console.log("handlePopup");
  };

  const waitForRefs = () =>
    new Promise((resolve) => {
      const check = () => {
        if (elementosRef.current.length > 0) resolve();
        else requestAnimationFrame(check);
      };
      check();
    });

  const findRef = (item) =>
    elementosRef.current?.find?.((el) => el?.dataset?.item === item) ?? null;

  const handlePopupClose = async (item) => {
    await waitForRefs();

    const { selectedItems } = useSelectStore.getState();
    if (!selectedItems || selectedItems.length === 0) return;

    const elementoSeleccionado = selectedItems[0];
    const listas = mapaListas[item]?.slice(1)?.[0]?.split("*") ?? [];

    const camposActualizar = listas.map((str) => {
      const [item, indice] = str.split("|");
      return { item, indice: Number(indice) };
    });

    setDatasets((prev) => {
      const nuevo = { ...prev };
      camposActualizar.forEach(({ item, indice }) => {
        const el = findRef(item);
        if (!el) return;
        const valor = elementoSeleccionado[indice] ?? "";
        el.value = valor;
        el.dataset.value = valor;

        const anterior = prev[item] ?? {};

        nuevo[item] = {
          ...anterior,
          value: valor,
          item: el.dataset.item ?? "",
        };
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      return nuevo;
    });

    setTimeout(() => {
      const hiddenVH = findRef("11");
      if (hiddenVH) {
        hiddenVH.dataset.value = elementoSeleccionado[0];
        hiddenVH.value = elementoSeleccionado[0];
      }
    }, 500);

    setTimeout(() => {
      const item990 = "990";
      const elemento = findRef(item990);
      if (elemento && elemento.tagName === "SELECT") {
        elemento.dataset.value = elementoSeleccionado[1];
        setForcedOption((prev) => ({
          ...prev,
          [item990]: {
            value: elementoSeleccionado[1],
            label: elementoSeleccionado[1],
          },
        }));
        setOptionFlag((prev) => ({
          ...prev,
          [item990]: 1,
        }));
      }

      const item991 = "991";
      const elemento2 = findRef(item991);
      if (elemento2 && elemento2.tagName === "SELECT") {
        elemento2.dataset.value = elementoSeleccionado[2];
        setForcedOption((prev) => ({
          ...prev,
          [item991]: {
            value: elementoSeleccionado[2],
            label: elementoSeleccionado[2],
          },
        }));
        setOptionFlag((prev) => ({
          ...prev,
          [item991]: 1,
        }));
      }
      setTimeout(() => {
        setIdVehiculo(elementoSeleccionado[0]);
      }, 500);
    }, 1000);

    setTimeout(() => {
      const hoy = new Date();
      const fechaLocal = new Date(
        hoy.getTime() - hoy.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];

      const fechaActivacion = findRef("3");
      const fechaCancelacion = findRef("4");
      const checkBoxSel = findRef("5");

      if (checkBoxSel) {
        checkBoxSel.checked = true;
        checkBoxSel.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (fechaActivacion && fechaActivacion.dataset.valor === "") {
        fechaActivacion.dataset.value = fechaLocal;
        fechaActivacion.value = fechaLocal;
      }
      if (fechaCancelacion && fechaCancelacion.dataset.valor === "") {
        setShowNewTarjeta(false);
      } else {
        setShowNewTarjeta(true);
      }
    }, 2000);

    const { setSelectedItems } = useSelectStore.getState();
    setSelectedItems([]);
  };

  const handleChange = (e) => {
    const { value, valor, item } = e.target.dataset;

    let nuevoValor = valor;
    const elFechaActivacion = elementosRef.current
      .filter(Boolean)
      .find((el) => el.dataset.item === "3");

    const elFechaCancelacion = elementosRef.current
      .filter(Boolean)
      .find((el) => el.dataset.item === "4");

    if (item === "5") {
      nuevoValor =
        e.target.type === "checkbox"
          ? e.target.checked
            ? "1"
            : "0"
          : e.target.dataset.valor;

      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el.dataset.item === item);

      const estaChecked = elemento.checked;
      const hoy = new Date();
      const fechaLocal = new Date(
        hoy.getTime() - hoy.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];

      if (elFechaActivacion.dataset.valor === "") {
        if (estaChecked) {
          elFechaActivacion.value = fechaLocal;
          elFechaActivacion.dataset.value = fechaLocal;
        } else {
          elFechaActivacion.value = "";
          elFechaActivacion.dataset.value = "";
        }
      } else {
        if (estaChecked) {
          elFechaCancelacion.value = "";
          elFechaCancelacion.dataset.value = "";
        } else {
          elFechaCancelacion.value = fechaLocal;
          elFechaCancelacion.dataset.value = fechaLocal;
        }
      }
    }

    setDatasets((prev) => ({
      ...prev,
      [item]: { value, valor: nuevoValor, item },
    }));
  };

  const handleNuevaTarjeta = () => {
    const items = ["10", "2", "3", "4", "5"];
    const elFechCan = elementosRef.current
      .filter(Boolean)
      .find((el) => el?.dataset?.item === "4");
    if (elFechCan && elFechCan.dataset.valor !== "") {
      items.forEach((item) => {
        const elemento = elementosRef.current
          .filter(Boolean)
          .find((el) => el?.dataset?.item === item);
        if (elemento) {
          elemento.value = "";
          elemento.dataset.value = "";
          elemento.dataset.valor = "";
          if (elemento.type === "checkbox") {
            elemento.checked = false;
          }
          elemento.dispatchEvent(new Event("input", { bubbles: true }));
          elemento.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    } else {
      alert("La tarjeta debe estar cancelada para poder crear una nueva");
    }
  };

  const llenarCombos = (valor) => {
    const lista = mapaListas?.[valor] ?? [];
    return lista;
  };

  const handleGuardarClick = () => {
    setShowConfirm(true);
  };

  useEffect(() => {
    elementosRef.current = elementosRef.current.filter((el) => el !== null);
  }, [agrupado]);

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: id_vehiculo{error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  const urlMap = {
    990: "/Home/TraerTarjetaMultiflotaPlacaInterna",
    991: "/Home/TraerTarjetaMultiflotaPlacaRodaje",
  };

  return (
    <>
      <div className="text-xl font-bold mb-4 text-green-800 flex items-center justify-between gap-2">
        <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
          MANTENIMIENTO DE TARJETAS MULTIFLOTA :
        </h2>
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
                  const hideElement = metadata?.[14] === "1";
                  maxLength =
                    metadata?.[4] === "" ? maxLength : Number(metadata[4]);

                  const colSpanMap = {
                    "-1": "w-1/2",
                    1: "col-span-1",
                    2: "col-span-2",
                    3: "col-span-3",
                    4: "col-span-4",
                  };

                  return (
                    <div
                      key={`${idx}-${refreshKey}`}
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
                        url={urlMap[metadata[6]] ?? ""}
                        onPopupClick={() => handlePopup(metadata[6])}
                        onPopupClose={() => handlePopupClose(metadata[6])}
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
                                (datasets[metadata[6]]?.value ?? data) === "1",
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
                              ...(metadata?.[11] === "1"
                                ? { isDefault: 1 }
                                : {}),
                            }
                          : typeCode === 151
                            ? {
                                defaultValue: datos.data,
                                unaLinea: metadata?.[11],
                                offsetColumnas: metadata?.[12],
                                ancho: metadata?.[13],
                                isFilter: metadata[0] === "1.11" ? "" : "",
                                forcedOption:
                                  forcedOption?.[metadata[6]] ?? null,
                                optionFlag: optionFlag?.[metadata[6]] ?? null,
                                setOptionFlag: (value) => {
                                  setOptionFlag((prev) => ({
                                    ...prev,
                                    [metadata[6]]: value,
                                  }));
                                },
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
          ),
      )}
      {showNewTarjeta && (
        <div className="flex justify-between items-center w-full gap-4 mt-8 mb-2">
          <CustomElement
            typeCode={120}
            onClick={handleNuevaTarjeta}
            className="!w-auto"
          >
            NUEVA TARJETA MULTIFLOTA
          </CustomElement>
        </div>
      )}
      {!isEdit && (
        <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
          HISTORIAL DE CAMBIOS DE TARJETAS MULTIFLOTA :
        </h2>
      )}
      <div className="mb-4 flex-1 min-h-0 overflow-y-auto pr-2">
        {isEdit && (
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
              onSelect={() => {}}
            />
          </div>
        )}
      </div>
      <div className="mt-8 mb-2">
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
                : tipoToast === "warning"
                  ? "bg-yellow-400 text-black animate-bounce"
                  : "bg-red-400 text-white animate-bounce"
            }`}
          >
            {mensajeToast}
          </div>
        )}
        <div className="flex justify-between items-center w-full gap-4 mt-8 mb-2">
          <CustomElement
            typeCode={120}
            onClick={handleGuardarClick}
            className="!w-auto"
          >
            GRABAR
          </CustomElement>
        </div>
        {showConfirm && (
          <ConfirmDialog
            message="¿Deseas guardar los cambios?"
            onConfirm={() => {
              setShowConfirm(false);
              handleClick();
            }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </>
  );
};

export default ProgTarjetaMultiflota;
