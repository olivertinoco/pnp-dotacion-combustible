import { useState, useRef, useEffect, useMemo } from "react";
import { useSelectStore } from "../store/selectStore";
import CustomElement from "../components/CustomElement";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";

const ProgTarjetaMultiflota = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [datasets, setDatasets] = useState({});
  const [forcedOption, setForcedOption] = useState({});
  const [optionFlag, setOptionFlag] = useState({});

  const elementosRef = useRef([]);

  const API_RESULT_LISTAR = "/Home/TraerTarjetaMultiflota";
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);

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

  // NOTA: PARA VISUALIZAR LOS DATOS DEL HIDDENFIELD
  // ===============================================
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     const valores = Object.values(elementosRef.current);
  //     if (!valores.length) return;
  //     valores.forEach((el) => {
  //       if (el?.type === "hidden") {
  //         console.log(
  //           `Hidden encontrado: campo=${el.dataset?.campo}, item=${el.dataset?.item}, value=${el.dataset?.value}`,
  //         );
  //       }
  //     });
  //   }, 0);
  //   return () => clearTimeout(timer);
  // }, [agrupado]);
  // ===============================================

  const handlePopup = () => {
    console.log("handlePopup");
  };

  const handlePopupClose = (item) => {
    const { selectedItems } = useSelectStore.getState();
    if (!selectedItems || selectedItems.length === 0) return;
    const elementoSeleccionado = selectedItems[0];
    const listas = mapaListas[item]?.slice(1)?.[0]?.split("*") ?? [];

    setTimeout(() => {
      const camposActualizar = listas.map((str) => {
        const [item, indice] = str.split("|");
        return { item, indice: Number(indice) };
      });

      setDatasets((prev) => {
        const nuevo = { ...prev };
        camposActualizar.forEach(({ item, indice }) => {
          const el = elementosRef.current[item];
          if (!el) return;
          const valor = elementoSeleccionado[indice] ?? "";
          el.value = valor;
          el.dataset.value = valor;
          // el.dispatchEvent(new Event("input", { bubbles: true }));
          nuevo[item] = {
            value: valor,
            item: el.dataset.item ?? "",
          };
        });
        return nuevo;
      });
    }, 500);

    const item990 = "990";
    const elemento = elementosRef.current
      .filter(Boolean)
      .find((ele) => ele?.dataset?.item === item990);
    if (elemento && elemento.tagName === "SELECT") {
      elemento.dataset.value = elementoSeleccionado[0];
      setForcedOption((prev) => ({
        ...prev,
        [item990]: {
          value: elementoSeleccionado[0],
          label: elementoSeleccionado[1],
        },
      }));
      setOptionFlag((prev) => ({
        ...prev,
        [item990]: 1,
      }));
    }
    setTimeout(() => {
      const item991 = "991";
      const elemento2 = elementosRef.current
        .filter(Boolean)
        .find((ele) => ele?.dataset?.item === item991);
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
    }, 2000);

    const { setSelectedItems } = useSelectStore.getState();
    setSelectedItems([]);
  };

  const handleChange = (e) => {
    const { value, valor, item } = e.target.dataset;

    const elFechaActivacion = elementosRef.current
      .filter(Boolean)
      .find((el) => el.dataset.item === "3");

    const elFechaCancelacion = elementosRef.current
      .filter(Boolean)
      .find((el) => el.dataset.item === "4");

    if (item === "5") {
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

      if (estaChecked) {
        elFechaActivacion.value = fechaLocal;
      } else {
        elFechaActivacion.value = "";
      }
    }

    setDatasets((prev) => ({
      ...prev,
      [item]: { value, valor, item },
    }));
  };

  const llenarCombos = (valor) => {
    const lista = mapaListas?.[valor] ?? [];
    return lista;
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
                                // usarHardcodedExterno:
                                //   usarHardcodedExternoMap[metadata[6]] ?? false,
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
    </>
  );
};

export default ProgTarjetaMultiflota;
