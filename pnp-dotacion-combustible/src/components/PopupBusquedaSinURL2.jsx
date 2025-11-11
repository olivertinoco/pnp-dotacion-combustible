import {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import CustomElement from "./CustomElement";
import { BaseTablaMatriz2 } from "./BaseTablaMatriz2";
import { useSelectStore } from "../store/selectStore";

const PopupBusquedaSinURL2 = forwardRef(
  (
    {
      onClose,
      etiqueta,
      ancho,
      listaDatos,
      onChange,
      parentRef,
      offsetColumnas,
      progRuta,
      metaDataKeys,
    },
    ref,
  ) => {
    const elementosRef = useRef([]);
    const [datasets] = useState({});
    const [popupContent, setPopupContent] = useState(false);
    const [programaRuta, setProgramaRuta] = useState(null);
    const [cabeceraClave, setCabeceraClave] = useState([]);
    const [configTable, setConfigTable] = useState({});

    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString();
    };

    const setSelectedItems = useSelectStore((state) => state.setSelectedItems);
    useEffect(() => {
      const { selectedItems } = useSelectStore.getState();
      if (!selectedItems) {
        setSelectedItems([]);
      }
    }, []);

    useEffect(() => {
      setProgramaRuta(progRuta);
    }, [progRuta]);

    useEffect(() => {
      setCabeceraClave(metaDataKeys);
    }, [metaDataKeys]);

    const preData = listaDatos?.[0];
    const info = [];
    const infoMeta = typeof preData === "string" ? preData.split("|") : [];

    const informacion = infoMeta.map((meta, idx) => ({
      data: info[idx] ?? "",
      metadata: (meta ?? "").split("*"),
    }));

    const ayudaGrifos = (listaDatos ?? []).slice(1);

    const datosItemShow = useMemo(() => {
      const base = cabeceraClave.slice(1, 3);
      const datosItemSubitems = cabeceraClave.slice(3);

      if (Array.isArray(datosItemSubitems) && datosItemSubitems.length > 0) {
        datosItemSubitems.forEach((item) => {
          const valores = item.split("|");
          const valorNro = Number(valores[2]);
          if (valorNro === Number(programaRuta)) {
            base.push(valores.join("|"));
          }
        });
      }
      return base;
    }, [cabeceraClave, programaRuta]);

    const hashArray = datosItemShow.map(hashString);

    useEffect(() => {
      setConfigTable({
        title: "PROGRAMACION DE GRIFOS:",
        isPaginar: false,
        listaDatos: datosItemShow,
        offsetColumnas: 11,
        hash: hashArray,
      });
    }, [datosItemShow]);

    console.log("progRuta", progRuta);

    const mapaListas = {
      default: [],
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
      if (datosItemShow && datosItemShow.length > 2) {
        setPopupContent(true);
      } else {
        setPopupContent(false);
      }
    }, [datosItemShow]);

    const handleRadioClickEvento = () => {
      console.log("handleRadioClickEvento");
    };

    const handleCheckDeleteEvento = () => {
      console.log("handleCheckDeleteEvento");
    };

    const handleFilaSeleccionada = () => {
      console.log("handleFilaSeleccionada");
    };

    const handleAddGrifoClick = () => {
      const txt_grifo = elementosRef.current
        .filter(Boolean)
        .find((el) => el.dataset.item === "701" && el.dataset.value !== "");
      const txt_dotacion = elementosRef.current
        .filter(Boolean)
        .find((el) => el.dataset.item === "705" && el.dataset.value !== "");
      const validos = !!txt_grifo && !!txt_dotacion;
      if (!validos) {
        alert("Existen valores requeridos...");
      } else {
        const txt_abastecimiento = elementosRef.current
          .filter(Boolean)
          .find((el) => el.dataset.item === "706");
        const { selectedItems } = useSelectStore.getState();
        if (!selectedItems || selectedItems.length === 0) return;
        const elementoSeleccionado = selectedItems[0];
        const valorReg = [];
        valorReg.push(cabeceraClave[0]);
        valorReg.push("");
        valorReg.push(programaRuta);
        valorReg.push(elementoSeleccionado[0]);
        valorReg.push(txt_abastecimiento.value);
        valorReg.push(txt_dotacion.value);
        valorReg.push("1");
        valorReg.push(elementoSeleccionado[2]);
        valorReg.push(elementoSeleccionado[4]);
        valorReg.push(elementoSeleccionado[5]);
        valorReg.push(elementoSeleccionado[6]);
        valorReg.push(elementoSeleccionado[2]);
        valorReg.push(txt_dotacion.value);

        const poblar = valorReg.join("|");

        setConfigTable((prev) => ({
          ...prev,
          listaDatos: [...(prev.listaDatos || []), poblar],
        }));

        console.log("cabeceraClave", datosItemShow);

        useSelectStore.setState({ selectedItems: [] });
      }
    };

    const handleCerrarPopup = () => {
      const { selectedItems } = useSelectStore.getState();
      if (!selectedItems || selectedItems.length === 0) return;
      const elementoSeleccionado = selectedItems[0];
      const mapping = [
        { item: "702", index: 4 },
        { item: "703", index: 5 },
        { item: "704", index: 6 },
      ];
      mapping.forEach(({ item, index }) => {
        elementosRef.current.forEach((el) => {
          if (el.dataset.item === item) {
            el.dataset.value = elementoSeleccionado[index];
            el.value = elementoSeleccionado[index];
          }
        });
      });
    };

    const handleGrabarProgGrifo = () => {
      console.log("grabar datos del la prog grifos:");
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div
          className="bg-white p-6 rounded-lg shadow-lg"
          style={{ width: ancho ? `${ancho}px` : "80vw" }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center justify-start gap-5">
            UNIDAD:{"  "} {etiqueta}
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
                    ref={(el) => {
                      if (el) elementosRef.current[metadata[6]] = el;
                    }}
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
                            options: ayudaGrifos,
                            unaLinea: metadata?.[11],
                            offsetColumnas: metadata?.[12],
                            ancho: metadata?.[13],
                            onPopupClose: () => handleCerrarPopup(),
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

          <div className="mt-8 mb-2">
            <CustomElement
              typeCode={120}
              onClick={() => handleAddGrifoClick()}
              style={{ width: "50%" }}
              className="font-bold text-white text-lg border border-gray-300 rounded shadow-md px-3 py-1"
            >
              AGREGAR GRIFO NUEVO
            </CustomElement>
            {!popupContent && (
              <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
                PROGRAMACION DE GRIFOS:
              </h2>
            )}
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
                <BaseTablaMatriz2
                  configTable={configTable}
                  handleRadioClick={handleRadioClickEvento}
                  handleCheckDelete={handleCheckDeleteEvento}
                  isEditing={true}
                  onSelect={handleFilaSeleccionada}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleGrabarProgGrifo}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              GRABAR PROGRAMACION DE GRIFO
            </button>
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

export default PopupBusquedaSinURL2;
