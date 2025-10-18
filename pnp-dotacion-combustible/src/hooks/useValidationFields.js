import { useState } from "react";

const useValidationFields = (elementosRef) => {
  const [mensajeError, setMensajeError] = useState("");
  const [esValido, setEsValido] = useState(false);
  const [valoresCambiados, setValoresCambiados] = useState({
    data: [],
    campos: [],
  });

  const handleClick = () => {
    let hayErrores = false;
    const nuevosData = [];
    const nuevosCampos = [];

    elementosRef.current.forEach((wrapper) => {
      if (!wrapper) return;
      const input = wrapper.querySelector("input, select, textarea") || wrapper;
      if (!input) return;
      if (input.type === "hidden") return;

      const dsValue = input.dataset?.value ?? "";
      const dsValor = input.dataset?.valor ?? "";
      const dsCampo = input.dataset?.campo ?? "";

      if (dsValue !== dsValor && !dsCampo.startsWith("0")) {
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

    setValoresCambiados({ data: nuevosData, campos: nuevosCampos });
    if (hayErrores) {
      setEsValido(false);
      setMensajeError("Existen campos obligatorios");
      setTimeout(() => {
        setMensajeError("");
      }, 2000);
    } else {
      setEsValido(true);
      setMensajeError("");
    }
  };
  return { handleClick, mensajeError, esValido, valoresCambiados };
};

export default useValidationFields;
