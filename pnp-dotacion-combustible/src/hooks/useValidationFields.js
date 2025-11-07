import { useState, useRef } from "react";

const useValidationFields = (elementosRef) => {
  const [mensajeError, setMensajeError] = useState("");
  const [esValido, setEsValido] = useState(false);
  const [valoresCambiados, setValoresCambiados] = useState({
    data: [],
    campos: [],
  });

  const valoresRef = useRef(valoresCambiados);
  const validoRef = useRef(esValido);

  valoresRef.current = valoresCambiados;
  validoRef.current = esValido;

  const handleClick = () => {
    let hayErrores = false;
    const nuevosData = [];
    const nuevosCampos = [];
    const unicos = new Set();

    Object.values(elementosRef.current).forEach((wrapper) => {
      if (!wrapper || unicos.has(wrapper)) return;
      unicos.add(wrapper);
      const input = wrapper.querySelector("input, select, textarea") || wrapper;

      if (
        input?.type?.toLowerCase() === "hidden" ||
        wrapper?.type?.toLowerCase() === "hidden" ||
        input?.getAttribute("type") === "hidden" ||
        wrapper?.getAttribute("type") === "hidden" ||
        wrapper.querySelector('input[type="hidden"]')
      ) {
        return;
      }

      const dsValue = input.dataset?.value ?? "";
      const dsValor = input.dataset?.valor ?? "";
      const dsCampo = input.dataset?.campo ?? "";

      if (dsValue !== dsValor && !dsCampo.startsWith("100")) {
        nuevosData.push(dsValue);
        nuevosCampos.push(dsCampo);
      }

      const isRequired = input?.dataset.required === "true" || input?.required;
      if (isRequired) {
        let value = dsValue;
        if (input.type === "checkbox" || input.type === "radio") {
          value = input.checked ? "1" : "";
        }
        if (input.multiple && typeof value === "string") {
          value = value
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v)
            .join(",");
        }
        const tieneError = !value || value.toString().trim() === "";
        if (tieneError) {
          hayErrores = true;
          wrapper.classList.add("border-2", "border-red-500", "rounded-md");
        } else {
          wrapper.classList.remove("border-2", "border-red-500", "rounded-md");
        }
      }
    });

    const camposLimpios = [];
    const dataLimpios = [];
    nuevosCampos.forEach((campo, i) => {
      if (campo && !camposLimpios.includes(campo)) {
        camposLimpios.push(campo);
        dataLimpios.push(nuevosData[i]);
      }
    });

    const nuevosValores = { data: dataLimpios, campos: camposLimpios };
    setValoresCambiados(nuevosValores);
    valoresRef.current = nuevosValores;

    if (hayErrores) {
      setEsValido(false);
      validoRef.current = false;
      setMensajeError("Existen campos obligatorios");
      setTimeout(() => {
        setMensajeError("");
      }, 2000);
    } else {
      setEsValido(true);
      validoRef.current = true;
      setMensajeError("");
    }
  };
  return {
    handleClick,
    mensajeError,
    esValido,
    valoresCambiados,
    valoresRef,
    validoRef,
  };
};

export default useValidationFields;
