import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import CustomElement from "./CustomElement";
import { BaseTablaMatriz2 } from "./BaseTablaMatriz2";
import { useSelectStore } from "../store/selectStore";
// import { useLocation } from "react-router-dom";
import useLazyFetch from "../hooks/useLazyFetch";

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
      usuario,
    },
    ref,
  ) => {
    const elementosRef = useRef([]);
    const [datasets] = useState({});
    const [popupContent, setPopupContent] = useState(false);
    const [programaRuta, setProgramaRuta] = useState(null);
    const [cabeceraClave, setCabeceraClave] = useState([]);
    const [configTable, setConfigTable] = useState({});
    const [datosItemShow, setDatosItemShow] = useState([]);
    const [forcedOption, setForcedOption] = useState({});
    const [optionFlag, setOptionFlag] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [filaSeleccionada, setFilaSeleccionada] = useState([]);
    const [mensajeToast, setMensajeToast] = useState("");
    const [tipoToast, setTipoToast] = useState("success");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const location = useLocation();
    // const usuario = location.state?.value;

    const { runFetch } = useLazyFetch();

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

    useEffect(() => {
      if (cabeceraClave.length === 0) return;
      const base = cabeceraClave.slice(1, 3);
      const datosItemSubitems = cabeceraClave.slice(3);

      for (const item of datosItemSubitems) {
        const valores = item.split("|");
        const valorNro = Number(valores[2]);
        if (valorNro === Number(programaRuta)) {
          base.push(valores.join("|"));
        }
      }
      setDatosItemShow(base);
    }, [cabeceraClave, programaRuta]);

    useEffect(() => {
      setConfigTable((prev) => {
        const listaDatos = datosItemShow || [];
        const prevHash = prev?.hash || [];

        const nuevoHash = listaDatos.map((fila, idx) => {
          const hashExistente = prevHash[idx];
          if (typeof hashExistente !== "undefined") {
            return hashExistente;
          }
          const campos = fila.split("|");
          if (!campos[1] || campos[1].trim() === "") return "";
          return hashString(fila);
        });

        return {
          ...prev,
          title: "PROGRAMACION DE GRIFOS:",
          isPaginar: false,
          listaDatos,
          offsetColumnas: 11,
          hash: nuevoHash,
        };
      });
    }, [datosItemShow]);

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
          console.warn("Error al propagar al padre:", err);
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

    const limpiarElementos = () => {
      const item = "701";
      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el?.dataset?.item === item);
      const mapping = [
        { item: "702", index: 8 },
        { item: "703", index: 9 },
        { item: "704", index: 10 },
        { item: "705", index: 5 },
        { item: "706", index: 4 },
      ];
      setIsEdit(false);
      if (elemento && elemento.tagName === "SELECT") {
        setTimeout(() => {
          elemento.dataset.value = "";
        }, 1000);
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
      mapping.forEach(({ item }) => {
        elementosRef.current.forEach((el) => {
          if (el?.dataset?.item === item) {
            el.dataset.value = "";
            el.value = "";
          }
        });
      });
    };

    const handleRadioClickEvento = (fila) => {
      const item = "701";
      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el?.dataset?.item === item);
      const mapping = [
        { item: "702", index: 8 },
        { item: "703", index: 9 },
        { item: "704", index: 10 },
        { item: "705", index: 5 },
        { item: "706", index: 4 },
      ];
      if (fila) {
        setIsEdit(true);
        setFilaSeleccionada(fila);
        mapping.forEach(({ item, index }) => {
          elementosRef.current.forEach((el) => {
            if (el?.dataset?.item === item) {
              let valor = fila[index];
              if (el.type === "date" && valor) {
                valor = valor.split("T")[0];
              }
              el.dataset.value = valor;
              el.value = valor;
            }
          });
        });
        if (elemento && elemento.tagName === "SELECT") {
          elemento.dataset.value = fila[3];
          setForcedOption((prev) => ({
            ...prev,
            [item]: {
              value: fila[3],
              label: fila[7],
            },
          }));
          setOptionFlag((prev) => ({
            ...prev,
            [item]: 1,
          }));
        }
      } else {
        setIsEdit(false);
        limpiarElementos();
        setFilaSeleccionada([]);
      }
    };

    const handleCheckDeleteEvento = (fila) => {
      if (!fila) return;
      const posicion = fila.index;

      if (fila.fila[1] === "") {
        setConfigTable((prev) => ({
          ...prev,
          listaDatos: (prev.listaDatos || []).filter(
            (_, idx) => idx !== posicion,
          ),
        }));
        setDatosItemShow((prev) => prev.filter((_, idx) => idx !== posicion));
      } else {
        setConfigTable((prev) => {
          const nuevaLista = [...(prev.listaDatos || [])];
          if (posicion > -1 && posicion < nuevaLista.length) {
            const partes = nuevaLista[posicion].split("|");
            partes[6] = fila.checked === 1 ? "0" : "1";
            nuevaLista[posicion] = partes.join("|");
          }
          return {
            ...prev,
            listaDatos: nuevaLista,
          };
        });
      }
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
        return;
      }
      if (isEdit) {
        const txt_dotacion = elementosRef.current
          .filter(Boolean)
          .find((el) => el.dataset.item === "705");
        const txt_abastecimiento = elementosRef.current
          .filter(Boolean)
          .find((el) => el.dataset.item === "706");

        const dataDotacion = txt_dotacion.value;
        const dataAbastecimiento = txt_abastecimiento.value;
        let unidadSeleccion = [];
        const { selectedItems } = useSelectStore.getState();
        if (selectedItems && selectedItems.length > 0) {
          unidadSeleccion = selectedItems[0];
          filaSeleccionada[3] = unidadSeleccion[0];
          filaSeleccionada[7] = unidadSeleccion[2];
          filaSeleccionada[8] = unidadSeleccion[4];
          filaSeleccionada[9] = unidadSeleccion[5];
          filaSeleccionada[10] = unidadSeleccion[6];
          filaSeleccionada[11] = unidadSeleccion[7];
        }
        useSelectStore.setState({ selectedItems: [] });

        filaSeleccionada[4] = dataAbastecimiento;
        filaSeleccionada[5] = dataDotacion;
        filaSeleccionada[12] = dataDotacion;

        const posicion = Number(filaSeleccionada.slice(-1)[0]) + 2;
        if (!isNaN(posicion)) {
          const nuevaFilaSeleccionada = filaSeleccionada.slice(0, -1).join("|");
          const filaHash = hashString(nuevaFilaSeleccionada);
          const dataHash = configTable?.hash[posicion];
          if (filaHash !== dataHash) {
            const nuevaLista = [...(configTable.listaDatos || [])];
            nuevaLista[posicion] = nuevaFilaSeleccionada;
            setConfigTable((prev) => ({
              ...prev,
              listaDatos: nuevaLista,
            }));
            setDatosItemShow(nuevaLista);
            limpiarElementos();
          }
        }
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

        setDatosItemShow((prev) => {
          const next = Array.isArray(prev) ? [...prev, poblar] : [poblar];
          setConfigTable((prevf) => ({
            ...prevf,
            listaDatos: [...(prevf.listaDatos || []), poblar],
            hash: [...prevf.hash, ""],
          }));
          return next;
        });

        useSelectStore.setState({ selectedItems: [] });
        limpiarElementos();
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

      const item = "701";
      const elemento = elementosRef.current
        .filter(Boolean)
        .find((el) => el?.dataset?.item === item);

      if (elemento && elemento.tagName === "SELECT") {
        elemento.dataset.value = elementoSeleccionado[0];
        setForcedOption((prev) => ({
          ...prev,
          [item]: {
            value: elementoSeleccionado[0],
            label: elementoSeleccionado[2],
          },
        }));
        setOptionFlag((prev) => ({
          ...prev,
          [item]: 1,
        }));
      }
    };

    const handleGrabarProgGrifo = async () => {
      const arrayMetaData = [];
      const arrayDatos = [];
      let envioDatosDetalle = "";
      let dataEnviarCabecera = "";
      if (
        configTable &&
        Array.isArray(configTable.listaDatos) &&
        configTable?.listaDatos.length > 0
      ) {
        configTable.listaDatos.forEach((fila, index) => {
          if (index > 1) {
            const hashInicio = configTable?.hash[index];
            const hashFinal = hashString(fila);
            if (hashInicio !== hashFinal) {
              const partes = fila.split("|");
              const primeros7 = partes.slice(0, 7);
              const [metaData, ...listaAux] = primeros7;
              const preDatos = listaAux.join("|");
              arrayMetaData.push(metaData.replaceAll("+", "|"));
              arrayDatos.push(preDatos);
            }
          }
        });
      }
      if (arrayDatos.length > 0 && arrayMetaData.length > 0) {
        envioDatosDetalle =
          usuario.trim() +
          "~" +
          arrayDatos.join("|") +
          "|" +
          arrayMetaData.join("|");
      } else {
        setMensajeToast("NO existen datos que enviar");
        setTipoToast("error");
        setTimeout(() => setMensajeToast(""), 2000);
        return;
      }
      const formEnviar = dataEnviarCabecera + "^" + envioDatosDetalle;

      if (dataEnviarCabecera.trim() === "" && envioDatosDetalle.trim() === "")
        return;
      const formData = new FormData();
      formData.append("data", formEnviar);

      setIsSubmitting(true);
      let grabacionExitosa = false;
      let recuperaData = "";
      try {
        const result = await runFetch("/Home/TraerDatosProg_eo_grifo", {
          method: "POST",
          body: formData,
        });

        if (result) {
          grabacionExitosa = true;
          recuperaData = result;
          setMensajeToast("Datos Guardados Correctamente ...");
          setTipoToast("success");
          setIsEdit(true);
        }
      } catch (err) {
        console.error(err);
        setMensajeToast("Error al guardar la informacion ...");
        setTipoToast("error");
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
          setMensajeToast("");
          if (
            grabacionExitosa &&
            typeof onClose === "function" &&
            typeof recuperaData === "string"
          ) {
            onClose(recuperaData);
          }
        }, 1000);
      }
    };

    const handleFilaSeleccionada = () => {
      null;
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
                            forcedOption: forcedOption?.[metadata[6]] ?? null,
                            optionFlag: optionFlag?.[metadata[6]] ?? null,
                            setOptionFlag: (value) => {
                              setOptionFlag((prev) => ({
                                ...prev,
                                [metadata[6]]: value,
                              }));
                            },
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
              className={`font-bold text-white text-lg border border-gray-300 rounded shadow-md px-3 py-1`}
            >
              {/* AGREGAR RUTA*/}
              {isEdit ? "EDITAR RUTA GRIFO" : "AGREGAR NUEVA RUTA GRIFO"}
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
          {mensajeToast && (
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
          <div className="flex justify-between mt-4">
            <button
              onClick={handleGrabarProgGrifo}
              {...(isSubmitting ? { disabled: true } : {})}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              GRABAR PROGRAMACION DE GRIFO
            </button>
            <button
              onClick={() => {
                if (typeof onClose === "function") onClose(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
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
