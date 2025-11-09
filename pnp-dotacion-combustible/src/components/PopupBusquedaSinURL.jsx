import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import CustomElement from "./CustomElement";
import useValidationFields from "../hooks/useValidationFields";
import { BaseTablaMatriz } from "./BaseTablaMatriz";
import { useSelectStore } from "../store/selectStore";

const PopupBusquedaSinURL = forwardRef(
  (
    {
      onClose,
      etiqueta,
      ancho,
      listaDatos,
      onChange,
      parentRef,
      offsetColumnas,
      triggerChange,
    },
    ref,
  ) => {
    const elementosRef = useRef([]);
    const [datasets] = useState({});
    const [popupContent, setPopupContent] = useState(false);
    const [overrideOption, setOverrideOption] = useState(null);

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

    useEffect(() => {
      if (listasData && listasData.length > 1) {
        setPopupContent(true);
      } else {
        setPopupContent(false);
      }
    }, [listasData]);

    const configTable = {
      title: etiqueta,
      isPaginar: false,
      listaDatos: listasData ?? [],
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default PopupBusquedaSinURL;
