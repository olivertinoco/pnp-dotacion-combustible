import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import useValidationFields from "../hooks/useValidationFields";
import CustomElement from "../components/CustomElement";
import { useSelectStore } from "../store/selectStore";
import { BaseTablaMatriz2 } from "../components/BaseTablaMatriz2";
import PopupBusquedaSinURL2 from "../components/PopupBusquedaSinURL2";

const ProgExtraordinaria = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [datasets, setDatasets] = useState({});
  const inputRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");
  const [refreshKey, setRefreshKey] = useState(0);
  const [datoModelos, setDatoModelos] = useState("");
  const [closeChild, setCloseChild] = useState(false);
  const closeChildRef = useRef(closeChild);
  const [forcedOption, setForcedOption] = useState({});
  const [optionFlag, setOptionFlag] = useState({});
  const [usarHardcodedExternoMap, setUsarHardcodedExternoMap] = useState({});
  const [filaSeleccionada, setFilaSeleccionada] = useState([]);
  const [keyProgRuta, setKeyProgRuta] = useState("");
  const [configTable, setConfigTable] = useState({});
  const [buscaGrifo, setBuscaGrifo] = useState(false);
  const [popupConfigGrifo, setPopupConfigGrifo] = useState({});
  const [listaDsublista, setListaDsublista] = useState([]);
  const elementosRef = useRef([]);

  const API_RESULT_LISTAR = "/Home/TraerListaProgExtraOrd";

  const { data, loading, error } = useFetch(API_RESULT_LISTAR);
  const { runFetch } = useLazyFetch();

  const validacion = useValidationFields(elementosRef);
  const { handleClick, mensajeError, esValido, valoresCambiados } = validacion;

  const popupBusquedaGrifoRef = useRef(null);

  useEffect(() => {
    closeChildRef.current = closeChild;
  }, [closeChild]);

  useEffect(() => {
    let hayHiddenConValor = false;
    elementosRef.current.forEach((el) => {
      if (el?.type === "hidden" && el.dataset.value?.trim() !== "") {
        hayHiddenConValor = true;
      }
    });
    if (hayHiddenConValor) {
      setIsEdit(true);
    }
  }, []);

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  };

  const limpiarCamposYStores = () => {
    setDatasets({});
    setForcedOption({});
    setOptionFlag({});
    setConfigTable({});
    setIsEdit(false);

    try {
      const { setSelectedItems } = useSelectStore.getState();
      setSelectedItems([]);
    } catch (err) {
      console.warn("No se pudo limpiar Zustand:", err);
    }

    elementosRef.current.forEach((el) => {
      if (!el) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
        el.dataset.value = "";
        el.dataset.valor = "";
      }
      if (el && el.tagName === "SELECT")
        while (el.options.length > 0) el.remove(0);
    });

    Object.keys(mapaListas).forEach((key) => (mapaListas[key] = []));
    setRefreshKey((k) => k + 1);
    elementosRef.current = [];
  };

  const handleBuscarClick = async () => {
    setForcedOption({});
    setOptionFlag({});
    setDatasets({});
    setConfigTable({});

    if (!inputRef.current) return;
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
    if (result.startsWith("error")) {
      limpiarCamposYStores();
      return;
    }
    // const preData = result.split("~");
    const preData = typeof result === "string" ? result.split("~") : [];
    const info = preData?.[0]?.split("|") ?? [];
    const infoMeta = preData?.[1]?.split("|") ?? [];
    const dataAyudas = preData?.slice(3)?.join("~");

    if (
      !result ||
      result.trim() === "" ||
      !info.length ||
      info[0].trim() === ""
    ) {
      limpiarCamposYStores();
      return;
    }

    const informacion = infoMeta.map((meta, idx) => ({
      data: info[idx] ?? "",
      metadata: (meta ?? "").split("*"),
    }));

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

    informacion
      .filter((item) => item.metadata?.[5] !== "100")
      .forEach((item) => {
        const campo = item.metadata[0];
        const valor = item.data;
        const el = elementosRef.current.find(
          (ref) => ref?.dataset?.campo === campo,
        );
        if (!el) return;
        if (el.tagName === "SELECT") {
          const valorTrimmed = String(valor).trim();
          const aplicarValor = () => {
            const normalizar = (v) =>
              String(v ?? "")
                .trim()
                .toUpperCase();
            const opciones = Array.from(el.options || []);
            const opcion = opciones.find(
              (opt) => normalizar(opt.value) === normalizar(valor),
            );
            if (opcion) {
              const index = opciones.indexOf(opcion);
              opciones.forEach((opt) => (opt.selected = false));
              opcion.selected = true;
              el.selectedIndex = index;
              el.value = opcion.value;
              el.dataset.value = opcion.value;
              el.dataset.valor = opcion.value;
              if (!el.dataset.valor || el.dataset.valor === "")
                el.dataset.valor = el.dataset.value;
              el.dispatchEvent(new Event("change", { bubbles: true }));
              return true;
            }
            return false;
          };
          const estabaDeshabilitado = el.disabled;
          if (estabaDeshabilitado) el.disabled = false;
          aplicarValor();

          setDatasets((prev) => ({
            ...prev,
            [item.metadata[6]]: {
              value: valorTrimmed,
              valor: valorTrimmed,
              item,
            },
          }));
        } else if (["INPUT", "TEXTAREA"].includes(el.tagName)) {
          el.value = valor;
          el.dataset.value = valor;
          el.dataset.valor = valor;
          el.dispatchEvent(new Event("input", { bubbles: true }));

          setDatasets((prev) => ({
            ...prev,
            [item.metadata[6]]: { value: valor, valor: valor, item },
          }));
        }
      });

    if (dataAyudas) {
      const ayudasData = dataAyudas.split("^");

      const listaDetallekey = ayudasData
        .filter((reg) => reg.split("~")[0] === "741")
        .flatMap((reg) => reg.split("~").slice(1));

      setKeyProgRuta(listaDetallekey[0]);
      const listaDetalle01 = listaDetallekey.slice(1);
      const hashArray = listaDetalle01.map(hashString);

      setConfigTable({
        title: "PROGRAMACION DE RUTAS:",
        isPaginar: false,
        listaDatos: listaDetalle01,
        offsetColumnas: 11,
        hash: hashArray,
      });

      const lista743 = ayudasData
        .filter((reg) => reg.split("~")[0] === "743")
        .flatMap((reg) => reg.split("~").slice(1));

      setListaDsublista(lista743);

      const ayudas = ayudasData.filter((reg) => reg.split("~")[0] !== "741");
      const nroReg = ayudas.length;

      for (let i = 0; i < nroReg; i++) {
        const lsPlacas = ayudas[i].split("~");
        const nro = lsPlacas.length - 1;
        const item = lsPlacas[0];
        const dataZustand = lsPlacas[nro]?.split("|") ?? [];
        const elemento = elementosRef.current.find(
          (el) => el?.dataset?.item === item,
        );
        if (elemento && elemento.tagName === "SELECT") {
          setForcedOption((prev) => ({
            ...prev,
            [item]: {
              value: dataZustand[0],
              label: dataZustand[1],
            },
          }));
          setOptionFlag((prev) => ({
            ...prev,
            [item]: 1,
          }));
        }
        const { setSelectedItems } = useSelectStore.getState();
        setSelectedItems([dataZustand]);
        handlePopupClose(item);
      }
    }
    setTimeout(() => {
      elementosRef.current.forEach((el) => {
        if (el && el.dataset) {
          el.dataset.valor = el.dataset.value;
        }
      });
    }, 100);
  };

  const handleEnvio = useCallback(async () => {
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
            const primeros8 = partes.slice(0, 8);
            const [metaData, ...listaAux] = primeros8;
            const preDatos = listaAux.join("|");
            arrayMetaData.push(metaData.replaceAll("+", "|"));
            arrayDatos.push(preDatos);
          }
        }
      });
    }
    if (!valoresCambiados.data.length && !valoresCambiados.campos.length) {
      if (arrayDatos.length > 0 && arrayMetaData.length > 0) {
        null;
      } else {
        setMensajeToast("NO existen datos que enviar");
        setTipoToast("error");
        setTimeout(() => setMensajeToast(""), 2000);
        return;
      }
    }
    if (arrayDatos.length > 0 && arrayMetaData.length > 0) {
      envioDatosDetalle =
        usuario.trim() +
        "~" +
        arrayDatos.join("|") +
        "|" +
        arrayMetaData.join("|");
    }

    const nuevosData = [...valoresCambiados.data];
    const nuevosCampos = [...valoresCambiados.campos];
    const unicos = new Set();

    const resultadosHidden = nuevosCampos.map((campo) => {
      const elemento = elementosRef.current.find(
        (el) => el?.dataset?.campo === campo && el?.type === "hidden",
      );
      return !!elemento;
    });
    const soloHiddens = !resultadosHidden.includes(false);

    if (!soloHiddens) {
      Object.values(elementosRef.current).forEach((el) => {
        if (el?.type === "hidden" && el.dataset.campo) {
          const clave = `${el.dataset.campo}-${el.dataset.value}`;
          if (!unicos.has(clave)) {
            unicos.add(clave);
            nuevosCampos.unshift(el.dataset.campo);
            nuevosData.unshift(el.dataset.value);
          }
        }
      });
      dataEnviarCabecera =
        usuario.trim() +
        "~" +
        nuevosData.join("|") +
        "|" +
        nuevosCampos.join("|");
    }

    const formEnviar = dataEnviarCabecera + "^" + envioDatosDetalle;

    console.log("formEnviar", formEnviar);

    if (dataEnviarCabecera.trim() === "" && envioDatosDetalle.trim() === "")
      return;
    const formData = new FormData();
    formData.append("data", formEnviar);
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

        if (result.trim() !== "") {
          const rpta = result.trim().split("^");
          const elPK = elementosRef.current.find(
            (el) => el?.dataset?.item === "10",
          );
          elPK.dataset.value = rpta?.[0];
          if (rpta.length > 1) {
            const arregloDetalle = rpta.slice(1).flatMap((p) => p.split("~"));
            const arregloDetalleGuardar = arregloDetalle.slice(2);
            const hashArray = arregloDetalleGuardar.map(hashString);
            setConfigTable((prev) => ({
              ...prev,
              listaDatos: arregloDetalleGuardar,
              hash: hashArray,
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

  const mapaListas = useMemo(() => {
    return (listasData ?? []).reduce((acc, entry) => {
      const [itemKey, ...opciones] = entry.split("~");
      acc[itemKey] = opciones;
      return acc;
    }, {});
  }, [listasData]);

  useEffect(() => {
    const lista743 = mapaListas[743];
    if (lista743 && lista743.length > 0) {
      setListaDsublista(lista743);
    }
  }, []);

  useEffect(() => {
    const nuevoValor = mapaListas?.[741]?.[0];
    if (nuevoValor) {
      setKeyProgRuta(nuevoValor);
    }
  }, [mapaListas]);

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
  // }, [agrupado, refreshKey]);
  // ===============================================

  useEffect(() => {
    elementosRef.current = elementosRef.current.filter((el) => el !== null);
  }, [agrupado]);

  // NOTA: ASIGNA LOS VALORE POR DEFAULT DE LOS COMBOS
  // ===================================================
  useEffect(() => {
    elementosRef.current.forEach((el) => {
      if (
        el?.tagName === "SELECT" &&
        el.options.length > 0 &&
        !el.dataset.value
      ) {
        el.dataset.value = el.options[0].value ?? "";
      }
    });
  }, [agrupado]);

  const handleChange = (e) => {
    const { value, valor, campo, item } = e.target.dataset;

    setDatasets((prev) => ({
      ...prev,
      [item]: { value, valor, item },
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
  };

  const handleRadioClickEvento = (fila) => {
    setFilaSeleccionada(fila);
    const mapping = [
      { item: "4", index: 3 },
      { item: "30", index: 8 },
      { item: "31", index: 9 },
      { item: "32", index: 10 },
      { item: "34", index: 5 },
      { item: "35", index: 6 },
    ];
    const item = "993";
    const elemento = elementosRef.current.find(
      (el) => el?.dataset?.item === item,
    );
    if (fila) {
      if (elemento && elemento.tagName === "SELECT") {
        elemento.dataset.value = fila[4];
        setForcedOption((prev) => ({
          ...prev,
          [item]: {
            value: fila[4],
            label: fila[11],
          },
        }));
        setOptionFlag((prev) => ({
          ...prev,
          [item]: 1,
        }));
      }
      mapping.forEach(({ item, index }) => {
        elementosRef.current.forEach((el) => {
          if (el?.dataset?.item === item) {
            el.dataset.value = fila[index];
            el.value = fila[index];
          }
        });
      });
      setUsarHardcodedExternoMap((prev) => ({
        ...prev,
        [item]: true,
      }));
    } else {
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
      setUsarHardcodedExternoMap((prev) => ({
        ...prev,
        [item]: false,
      }));
    }
  };

  const handleRutaClick = () => {
    if (usarHardcodedExternoMap?.["993"]) {
      const nuevaFila = [];
      const mapping = [
        { item: "993", index: [4, 11] },
        { item: "4", index: [3, 12] },
        { item: "30", index: 8 },
        { item: "31", index: 9 },
        { item: "32", index: 10 },
        { item: "34", index: [5, 13] },
        { item: "35", index: 6 },
      ];
      mapping.forEach(({ item, index }) => {
        elementosRef.current.forEach((el) => {
          if (el?.dataset?.item === item) {
            if (el && el.tagName === "SELECT") {
              const [valorIndex, textoIndex] = index;
              nuevaFila[valorIndex] = el.dataset.value;
              filaSeleccionada[valorIndex] = nuevaFila[valorIndex];
              let selectedOption = el.options[el.selectedIndex];
              if (!selectedOption && el.options.length > 0) {
                selectedOption = el.options[0];
              }
              if (selectedOption) {
                nuevaFila[textoIndex] = selectedOption.textContent.trim();
                filaSeleccionada[textoIndex] = nuevaFila[textoIndex];
              } else {
                nuevaFila[textoIndex] = "";
                filaSeleccionada[textoIndex] = nuevaFila[textoIndex];
              }
            } else {
              const indices = Array.isArray(index) ? index : [index];
              indices.forEach((i) => {
                nuevaFila[i] = el.dataset.value;
                filaSeleccionada[i] = nuevaFila[i];
              });
            }
          }
        });
      });

      const posicion = Number(filaSeleccionada.slice(-1)[0]) + 2;
      if (!isNaN(posicion)) {
        const nuevaFilaSeleccionada = filaSeleccionada.slice(0, -1).join("|");
        const filaHash = hashString(nuevaFilaSeleccionada);
        const dataHash = configTable?.hash[posicion];
        if (filaHash !== dataHash) {
          const nuevaLista = [...(configTable.listaDatos || [])];
          nuevaLista[posicion] = nuevaFilaSeleccionada;
          setConfigTable({
            ...configTable,
            listaDatos: nuevaLista,
          });
        }
      }
    } else {
      const nuevaFila = [];
      const mapping = [
        { item: "993", index: [4, 11] },
        { item: "4", index: [3, 12] },
        { item: "30", index: 8 },
        { item: "31", index: 9 },
        { item: "32", index: 10 },
        { item: "34", index: [5, 13] },
        { item: "35", index: 6 },
      ];
      mapping.forEach(({ item, index }) => {
        elementosRef.current.forEach((el) => {
          if (el?.dataset?.item === item) {
            if (el && el.tagName === "SELECT") {
              const [valorIndex, textoIndex] = index;
              nuevaFila[valorIndex] = el.dataset.value;
              let selectedOption = el.options[el.selectedIndex];
              if (!selectedOption && el.options.length > 0) {
                selectedOption = el.options[0];
              }
              if (selectedOption) {
                nuevaFila[textoIndex] = selectedOption.textContent.trim();
              } else {
                nuevaFila[textoIndex] = "";
              }
            } else {
              const indices = Array.isArray(index) ? index : [index];
              indices.forEach((i) => {
                nuevaFila[i] = el.dataset.value;
              });
            }
          }
        });
      });
      let requerido = true;
      const elem1 = elementosRef.current.find(
        (el) => el.dataset.item === "4" && el.dataset.value !== "",
      );
      const elem2 = elementosRef.current.find(
        (el) => el.dataset.item === "993" && el.dataset.value !== "",
      );
      requerido = !!elem1 && !!elem2;

      if (!requerido) {
        alert("EXISTEN DATOS REQUERIDOS :");
      } else {
        elementosRef.current.forEach((el) => {
          if (el?.type === "hidden") {
            if (el?.dataset?.item === "10") {
              nuevaFila[2] = el.dataset.value;
            }
          }
        });
        nuevaFila[0] = keyProgRuta;
        nuevaFila[1] = "";
        nuevaFila[7] = "1";

        if (!configTable?.listaDatos || configTable.listaDatos.length === 0) {
          const cabecera = mapaListas[741].slice(1);
          const nuevaFilaDatos = [...cabecera, nuevaFila.join("|")];
          setConfigTable({
            title: "PROGRAMACION DE RUTAS:",
            isPaginar: false,
            listaDatos: nuevaFilaDatos,
            offsetColumnas: 11,
            hash: "",
          });
        } else {
          const nuevaFilaDatos = [
            ...(configTable.listaDatos || []),
            nuevaFila.join("|"),
          ];
          setConfigTable({
            ...configTable,
            listaDatos: nuevaFilaDatos,
          });
        }
      }
    }
  };

  const handleCheckDeleteEvento = (fila) => {
    if (!fila) return;
    const nuevaLista = [...(configTable.listaDatos || [])];
    const posicion = fila.index;
    if (fila.fila[1] === "") {
      if (posicion > -1 && posicion < nuevaLista.length) {
        nuevaLista.splice(posicion, 1);
        setConfigTable({
          ...configTable,
          listaDatos: nuevaLista,
        });
      }
    } else {
      if (posicion > -1 && posicion < nuevaLista.length) {
        const partes = nuevaLista[posicion].split("|");
        partes[7] = fila.checked === 1 ? "0" : "1";
        nuevaLista[posicion] = partes.join("|");
        setConfigTable({
          ...configTable,
          listaDatos: nuevaLista,
        });
      }
    }
  };

  const handleFilaSeleccionada = (fila) => {
    if (Array.isArray(fila) && fila[1] !== "") {
      const listaDatos = mapaListas[77];
      setPopupConfigGrifo({
        etiqueta: fila[11],
        ancho: "1200",
        optionsProp: listaDatos,
        offsetColumnas: 1,
        progRuta: fila[1],
        metaDataKeys: listaDsublista,
      });
      setBuscaGrifo(true);
    }
  };

  const handleChangeDesdePopup = () => {
    console.log("DESDE EL POPUP GRIFOS...");
  };

  const handleListaProgGrifos = (datosRecib) => {
    if (datosRecib) {
      const [_, ...datosRecibidos] = datosRecib.split("~");
      mapaListas[743] = [...datosRecibidos];
      const lista743 = [...datosRecibidos];
      setListaDsublista(lista743);
    }
  };

  const urlMap = {
    990: "/Home/TraerDatosProgVehiculoAyudas",
    991: "/Home/TraerDatosProgUnidadesAyudas",
    992: "/Home/TraerDatosProgCIPAyudas",
    993: "/Home/TraerDatosProgUnidadesAyudas",
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
                                isFilter:
                                  metadata[0] === "1.11" ? datoModelos : "",
                                forcedOption:
                                  forcedOption?.[metadata[6]] ?? null,
                                optionFlag: optionFlag?.[metadata[6]] ?? null,
                                setOptionFlag: (value) => {
                                  setOptionFlag((prev) => ({
                                    ...prev,
                                    [metadata[6]]: value,
                                  }));
                                },
                                usarHardcodedExterno:
                                  usarHardcodedExternoMap[metadata[6]] ?? false,
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
                                  llenarCombos(
                                    metadata[6],
                                    metadata[0],
                                    data,
                                  ) || [];
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

      <div className="mt-8 mb-2">
        <CustomElement
          typeCode={120}
          onClick={() => handleRutaClick()}
          style={{ width: "50%" }}
          className="font-bold text-white text-lg border border-gray-300 rounded shadow-md px-3 py-1"
        >
          {usarHardcodedExternoMap?.["993"]
            ? "MODIFICANDO LA RUTA"
            : "AGREGAR RUTA NUEVA"}
        </CustomElement>
        {(!configTable?.listaDatos || configTable?.listaDatos.length === 0) && (
          <h2 className="mt-4 text-lg font-semibold text-green-700 mb-4 border-b border-green-300 pb-1">
            PROGRAMACION DE RUTAS
          </h2>
        )}
        {configTable?.listaDatos && configTable?.listaDatos.length > 0 && (
          <BaseTablaMatriz2
            configTable={configTable}
            handleRadioClick={handleRadioClickEvento}
            handleCheckDelete={handleCheckDeleteEvento}
            isEditing={true}
            onSelect={handleFilaSeleccionada}
          />
        )}
        {buscaGrifo && (
          <PopupBusquedaSinURL2
            ref={popupBusquedaGrifoRef}
            parentRef={popupBusquedaGrifoRef}
            onClose={(datosRecibidos) => {
              handleListaProgGrifos(datosRecibidos);
              setBuscaGrifo(false);
              setPopupConfigGrifo({});
            }}
            etiqueta={popupConfigGrifo.etiqueta}
            ancho={popupConfigGrifo.ancho}
            listaDatos={popupConfigGrifo.optionsProp}
            onChange={handleChangeDesdePopup}
            offsetColumnas={popupConfigGrifo.offsetColumnas}
            progRuta={popupConfigGrifo.progRuta}
            metaDataKeys={popupConfigGrifo.metaDataKeys}
          />
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
                : "bg-red-400 text-white animate-bounce"
            }`}
          >
            {mensajeToast}
          </div>
        )}
        <CustomElement
          typeCode={120}
          onClick={() => handleClick()}
          {...(isSubmitting ? { disabled: true } : {})}
        >
          {isSubmitting ? "Guardando..." : "GUARDAR"}
        </CustomElement>
      </div>
    </>
  );
};

export default ProgExtraordinaria;
