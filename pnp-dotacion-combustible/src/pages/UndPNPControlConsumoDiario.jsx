import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import CustomElement from "../components/CustomElement";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";

const UndPNPControlConsumoDiario = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [forcedOption, setForcedOption] = useState({});
  const [optionFlag, setOptionFlag] = useState({});
  const [datasets, setDatasets] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const elementosRef = useRef([]);

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

  // console.log("mapaListas", mapaListas);
  // console.log("informacion", informacion);

  const handlePopup = () => {
    console.log("handlePopup");
  };

  const handlePopupClose = () => {
    console.log("handlePopupClose");
  };

  const handleChange = () => {
    console.log("handleChange");
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
    990: "/Home/TraerDatosProgUnidadesAyudas",
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

export default UndPNPControlConsumoDiario;
