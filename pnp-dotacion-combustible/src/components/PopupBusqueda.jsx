import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import CustomElement from "./CustomElement";
import useValidationFields from "../hooks/useValidationFields";
import useLazyFetch from "../hooks/useLazyFetch";
import { BaseTablaMatriz } from "./BaseTablaMatriz";
import { useSelectStore } from "../store/selectStore";

const PopupBusqueda = forwardRef(
  (
    {
      onClose,
      etiqueta,
      ancho,
      listaDatos,
      onChange,
      parentRef,
      url,
      offsetColumnas,
      triggerChange,
    },
    ref,
  ) => {
    const elementosRef = useRef([]);
    const [datasets] = useState({});
    const [popupContent, setPopupContent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensajeToast, setMensajeToast] = useState("");
    const [overrideOption, setOverrideOption] = useState(null);
    const [tipoToast, setTipoToast] = useState("success");
    const { runFetch } = useLazyFetch();

    const setSelectedItems = useSelectStore((state) => state.setSelectedItems);
    useEffect(() => {
      const { selectedItems } = useSelectStore.getState();
      if (!selectedItems) {
        setSelectedItems([]);
      }
    }, []);

    const { handleClick, mensajeError, esValido, valoresCambiados } =
      useValidationFields(elementosRef);

    const preData = listaDatos?.[0];
    const info = [];
    const infoMeta = typeof preData === "string" ? preData.split("|") : [];

    const informacion = infoMeta.map((meta, idx) => ({
      data: info[idx] ?? "",
      metadata: (meta ?? "").split("*"),
    }));

    const elementos = informacion.map(({ metadata }) => metadata[0]);

    const listasData = (listaDatos ?? []).slice(1);
    const mapaListas = {
      default: listasData,
    };

    useImperativeHandle(ref, () => ({
      updateSelected(value, label) {
        try {
          if (parentRef && parentRef.current) {
            parentRef.current.dataset.value = value;
            parentRef.current.dataset.label = label;
            parentRef.current.value = value;
          }
        } catch (err) {
          console.log("Error al propagar al padre:", err);
        }
      },
    }));

    const optionsPropRef = useRef([]);

    const handleEnvio = useCallback(async () => {
      if (!valoresCambiados.data.length && !valoresCambiados.campos.length) {
        setMensajeToast("NO existen datos que enviar");
        setTipoToast("error");
        setTimeout(() => setMensajeToast(""), 2000);
        return;
      }
      const resultado = elementos.map((el) => {
        const idx = valoresCambiados.campos.indexOf(el);
        return idx !== -1 ? valoresCambiados.data[idx] : "";
      });
      const dataEnviar = resultado.join("|");
      const formData = new FormData();
      formData.append("data", dataEnviar);
      // console.log("dataEnviar : ", dataEnviar);

      setIsSubmitting(true);
      try {
        const result = await runFetch(url, {
          method: "POST",
          body: formData,
        });

        if (result) {
          const partes = result.split("~");
          if (partes.length <= 2) {
            setMensajeToast("No se encontraron datos");
            setTipoToast("error");
            setPopupContent(false);
          } else {
            setMensajeToast("Datos encontrados correctamente ...");
            setTipoToast("success");
            setPopupContent(true);
            optionsPropRef.current = partes;
          }
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
    }, [runFetch, valoresCambiados]);

    useEffect(() => {
      if (esValido) {
        handleEnvio();
      }
    }, [esValido, handleEnvio]);

    const configTable = {
      title: etiqueta,
      isPaginar: true,
      listaDatos: optionsPropRef.current,
      offsetColumnas: offsetColumnas ?? 1,
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div
          className="bg-white p-6 rounded-lg shadow-lg"
          style={{ width: ancho ? `${ancho}px` : "80vw" }}
        >
          <h2 className="text-lg font-bold mb-4">
            Busqueda de {configTable.title}
          </h2>

          <div
            // className="flex flex-nowrap items-end gap-4 mb-6 overflow-x-auto pb-2"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {informacion.map((datos, idx) => {
              const { data, metadata } = datos;
              const typeCode = Number(metadata?.[5] ?? 0);
              let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
              const isRequired = metadata?.[1] === "0";
              const isDisabled = metadata?.[8] === "1";
              const hideElement = metadata?.[14] === "1";
              maxLength =
                metadata?.[4] === "" ? maxLength : Number(metadata[4]);

              const colSpanMap = {
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
                    key={idx}
                    ref={(el) => (elementosRef.current[idx] = el)}
                    typeCode={typeCode}
                    etiqueta={metadata[7] ?? ""}
                    placeholder={metadata[7] ?? ""}
                    popupTipo={metadata[6] ?? ""}
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
                          ...(metadata?.[11] === "1" ? { isDefault: 1 } : {}),
                          options: mapaListas.default,
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
                      value: datasets[metadata[0]]?.value ?? data,
                      valor: data,
                      campo: metadata[0],
                      item: metadata[6],
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex-shrink-0 mt-4">
            <CustomElement
              typeCode={120}
              onClick={handleClick}
              {...(isSubmitting ? { disabled: true } : {})}
            >
              {isSubmitting ? "BUSCANDO..." : "BUSCAR"}
            </CustomElement>
          </div>
          {mensajeError && tipoToast !== "success" && (
            <div className="mt-3 p-3 text-sm text-white bg-red-400 rounded-md shadow-md animate-bounce">
              {mensajeError}
            </div>
          )}
          {mensajeToast && tipoToast !== "success" && (
            <div
              className={`mt-3 p-3 text-sm rounded-md shadow-md ${
                tipoToast === "success"
                  ? "bg-green-700 text-white animate-bounce"
                  : "bg-red-400 text-white animate-bounce"
              }`}
            >
              {mensajeToast}
            </div>
          )}
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
                <BaseTablaMatriz
                  configTable={configTable}
                  onSelect={(fila) => {
                    const value = fila[0];
                    const label = fila[fila.length - 1];
                    setOverrideOption({ value, label });
                    setSelectedItems([fila]);

                    if (parentRef && parentRef.current) {
                      parentRef.current.dataset.value = value;
                      parentRef.current.dataset.label = label;
                      parentRef.current.value = value;
                    }
                    if (triggerChange) {
                      triggerChange(value, label);
                    }

                    if (ref && ref.current) {
                      try {
                        ref.current.dataset.value = value;
                        ref.current.dataset.label = label;
                        ref.current.value = value;
                      } catch (err) {
                        console.log(err);
                      }
                    }

                    const fakeEvent = {
                      target: {
                        value,
                        dataset: { value },
                        option: { value, label },
                      },
                    };
                    if (onChange) onChange(fakeEvent);
                    onClose();
                  }}
                  rowsPerPage={10}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-blue-300 hover:bg-blue-600 text-gray-800 px-4 py-2 rounded-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default PopupBusqueda;
