import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useLayoutEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { useSelectStore } from "../store/selectStore";
import CustomElement from "../components/CustomElement";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const UndPNPControlConsumoDiario = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [forcedOption, setForcedOption] = useState({});
  const [optionFlag, setOptionFlag] = useState({});
  const [datasets, setDatasets] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [events, setEvents] = useState([
    { title: "Evento 1", date: "2025-11-10" },
    { title: "Evento 2", date: "2025-11-15" },
  ]);

  const elementosRef = useRef([]);
  const calendarRef = useRef();
  const skipAsignarRef = useRef(false);

  const API_RESULT_LISTAR = "/Page/Traer_prog_abastecimiento_diario";
  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();

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

  const getDaysOfMonth = (year, month) => {
    const lastDay = new Date(year, month, 0).getDate();
    const days = [];
    for (let d = 1; d <= lastDay; d++) {
      days.push(String(d).padStart(2, "0"));
    }
    return days;
  };

  const asignarDias = async () => {
    await waitForRefs();

    if (skipAsignarRef.current) {
      skipAsignarRef.current = false;
      return;
    }
    skipAsignarRef.current = true;

    const elAnno = findRef("1");
    const elMess = findRef("2");
    const elDias = findRef("3");

    const anno = elAnno?.value ?? "";
    const mess = elMess?.value ?? "";

    if (anno !== "" && mess !== "") {
      const arrayDias = getDaysOfMonth(anno, mess);
      elDias.innerHTML = "";
      arrayDias.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item;
        opt.textContent = item;
        elDias.appendChild(opt);
      });

      elDias.value = arrayDias[0] ?? "";
      elDias.dataset.value = elDias.value;
      elDias.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const moverCalendario = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const elAnno = findRef("1");
    const elMess = findRef("2");

    const year = elAnno?.value ?? "";
    const month = elMess?.value ?? "";

    if (year !== "" && month !== "") {
      api.gotoDate(`${year}-${String(month).padStart(2, "0")}-01`);
    }
  };

  useLayoutEffect(() => {
    asignarDias();
  }, []);

  useEffect(() => {
    waitForRefs().then(() => {
      const elAnno = findRef("1");
      const elMess = findRef("2");

      if (elAnno) elAnno.addEventListener("change", moverCalendario);
      if (elMess) elMess.addEventListener("change", moverCalendario);
    });
  }, []);

  const handlePopupClose = async (item) => {
    await waitForRefs();
    const valoresValidos = ["992", "993"];

    if (valoresValidos.includes(item)) {
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
        const hiddenVHTARJ = findRef("12");
        if (hiddenVHTARJ) {
          hiddenVHTARJ.dataset.value = elementoSeleccionado[8];
          hiddenVHTARJ.value = elementoSeleccionado[8];
        }
      }, 500);

      setTimeout(() => {
        const item990 = "992";
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

        const item991 = "993";
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
      }, 1000);

      const { setSelectedItems } = useSelectStore.getState();
      setSelectedItems([]);
    }
  };

  const handleChange = (item) => {
    const elementos = ["1", "2"];
    if (elementos.includes(item)) {
      asignarDias();
    }
  };

  const llenarCombos = (valor) => {
    const lista = mapaListas?.[valor] ?? [];
    return lista;
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

  const urlMap = {
    990: "/Page/Buscar_prog_abastecimiento_diario_unidad",
    992: "/Page/Buscar_prog_abastecimiento_diario_placa_interna",
    993: "/Page/Buscar_prog_abastecimiento_diario_placa_rodaje",
  };

  return (
    <>
      <div className="text-xl font-bold mb-4 text-green-800 flex items-center justify-between gap-2">
        <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
          CONTROL DE CONSUMO DIARIO DE DOTACION DE COMBUSTIBLE :
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
                        onChange={() => handleChange(metadata[6])}
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
      <div style={{ width: "100%", margin: "0 auto" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          locale="es"
          headerToolbar={{
            left: "",
            center: "title",
            right: "",
          }}
          eventClick={(info) => {
            alert(`Hiciste clic en: ${info.event.title}`);
          }}
          datesSet={(info) => {
            const fechaVisibleInicio = info.start;
            const fechaMesReal = info.view.calendar.getDate();
            const elAnno = findRef("1");
            const elMess = findRef("2");
            if (elAnno && elMess) {
              elAnno.value = fechaVisibleInicio.getFullYear();
              elAnno.dataset.value = elAnno.value;
              const mesSeleccion = String(fechaMesReal.getMonth() + 1).padStart(
                2,
                "0",
              );
              elMess.value = mesSeleccion;
              elMess.dataset.value = mesSeleccion;
              asignarDias();
            }
          }}
        />
      </div>
    </>
  );
};

export default UndPNPControlConsumoDiario;
