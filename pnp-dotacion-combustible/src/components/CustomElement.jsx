import { useState, useEffect, useRef, forwardRef } from "react";
import { BaseTablaMatriz } from "./BaseTablaMatriz";
import PopupBusqueda from "./PopupBusqueda";
import { useSelectStore } from "../store/selectStore";

const CustomElement = forwardRef(
  ({ typeCode, dataAttrs = {}, options: optionsProp = [], ...props }, ref) => {
    const internalSelectRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const [overrideOption, setOverrideOption] = useState(null);
    const [showPopupEspecial, setShowPopupEspecial] = useState(false);
    const [usarHardcoded, setUsarHardcoded] = useState(false);
    const [hardcodedOption, setHardcodedOption] = useState(null);
    const [dataValue, setDataValue] = useState("");

    const selectedItems = useSelectStore((state) => state.selectedItems);

    const datasetProps = Object.entries(dataAttrs).reduce(
      (acc, [key, value]) => {
        acc[`data-${key}`] = value;
        return acc;
      },
      {},
    );

    if (typeCode === 100) {
      const { value, campo, item } = dataAttrs;
      return (
        <input
          type="hidden"
          ref={ref}
          data-campo={campo}
          data-value={value}
          data-item={item}
          value={value ?? ""}
          defaultValue={value ?? ""}
        />
      );
    }

    let Tag = "div";
    if (typeCode) {
      switch (typeCode) {
        case 101:
          Tag = "input";
          props.type = "text";
          break;
        case 102:
          Tag = "input";
          props.type = "date";
          break;
        case 103:
          Tag = "input";
          props.type = "checkbox";
          break;
        case 104:
          Tag = "input";
          props.type = "radio";
          break;
        case 105:
          Tag = "input";
          props.type = "password";
          break;
        case 106:
          Tag = "input";
          props.type = "file";
          break;
        case 111:
          Tag = "select";
          break;
        case 112:
          Tag = "selectMulti";
          break;
        case 113:
          Tag = "textArea";
          break;
        case 120:
          Tag = "button";
          break;
        case 150:
          Tag = "customPopupInputText";
          break;
        case 151:
          Tag = "customPopupSelectMulti";
          break;
        default:
          Tag = "div";
      }
    }

    if (Tag === "input") {
      const { etiqueta, onChange, tipoDato, ...restProps } = props;

      useEffect(() => {
        if (ref && ref.current && datasetProps) {
          Object.entries(datasetProps).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
              ref.current.setAttribute(k, String(v));
            }
          });
        }
      }, [datasetProps, ref]);

      const handleChange = (e) => {
        let value = e.target.value;

        if (tipoDato === "entero") {
          e.target.value = e.target.value.replace(/\D/g, "");
        } else if (tipoDato === "decimal") {
          // Permitir solo números y un punto decimal
          value = value.replace(/[^0-9.]/g, "");
          const parts = value.split(".");
          if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
          }
        } else if (props.type === "text") {
          value = value.toUpperCase();
        }
        e.target.value = value;

        if (props.type === "checkbox") {
          e.target.dataset.value = e.target.checked ? "1" : "0";
        } else if (props.type === "radio") {
          e.target.dataset.value = e.target.checked ? "1" : "0";
        } else {
          e.target.dataset.value = value;
        }

        if (onChange) onChange(e);
      };

      const handleKeyDown = (e) => {
        if (tipoDato === "entero") {
          const allowed = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
          ];
          if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
            e.preventDefault();
          }
        } else if (tipoDato === "decimal") {
          const allowed = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
          ];
          if (!/[0-9.]/.test(e.key) && !allowed.includes(e.key)) {
            e.preventDefault();
          }
          if (e.key === "." && e.currentTarget.value.includes(".")) {
            e.preventDefault();
          }
        }
      };

      if (props.type === "checkbox" || props.type === "radio") {
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              ref={ref}
              type={props.type}
              {...datasetProps}
              {...restProps}
              defaultChecked={datasetProps["data-value"] === "1"}
              onChange={handleChange}
              className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200" : ""}`}
            />
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-bold text-green-900">
                {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          </label>
        );
      }
      return (
        <label className="block w-full" style={restProps.style}>
          <div className="flex items-center gap-1 mb-1" style={restProps.style}>
            <span className="block text-sm font-bold text-green-900 mb-1">
              Ingrese {etiqueta?.replace(/nn/g, "ñ")}
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </div>
          <input
            ref={ref}
            type={props.type}
            {...datasetProps}
            {...restProps}
            defaultValue={restProps.defaultValue}
            {...(props.type === "checkbox"
              ? { checked: datasetProps["data-value"] === "1" }
              : {})}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-800 font-bold" : ""}`}
          />
        </label>
      );
    }

    if (Tag === "customPopupInputText") {
      const { etiqueta, popupContent, ...restProps } = props;
      return (
        <div className="block w-full">
          <label
            className="block w-3/4 mb-1 px-3 rounded-md border border-gray-400 bg-indigo-50 hover:bg-indigo-100 text-sm font-bold text-green-900 cursor-pointer shadow-sm transition"
            onClick={() => setShowPopup(true)}
          >
            <span className="text-sm font-bold text-green-900">
              {etiqueta} ( ... )
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            ref={ref}
            type="text"
            readOnly
            disabled
            {...datasetProps}
            {...restProps}
            defaultValue={restProps.defaultValue}
            className="block w-full rounded-md border px-3 py-2 shadow-sm text-gray-600 opacity-50 cursor-not-allowed bg-gray-200"
          />

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/0 backdrop-blur-sm z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4">Título del Popup</h2>
                <div className="mb-4">
                  {popupContent ?? <p>Aquí puedes mostrar más información.</p>}
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (Tag === "customPopupSelectMulti") {
      const {
        etiqueta,
        onChange,
        popupContent,
        unaLinea,
        offsetColumnas,
        ancho,
        isFilter,
        usarHardcodedExterno,
        onPopupClose,
        ...restProps
      } = props;

      const handleChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
          (opt) => opt.value,
        );
        e.target.dataset.value = selectedValues.join(",");
        if (onChange) onChange(e);
      };

      const handleChangeDesdePopup = (e) => {
        let newValues = [];
        if (e?.target?.selectedOptions) {
          newValues = Array.from(e.target.selectedOptions).map(
            (opt) => opt.value,
          );
        } else if (e?.target?.option) {
          const { value, label, extra, descr } = e.target.option;
          newValues = [value];
          if (ref && ref.current) {
            try {
              ref.current.value = value;
              ref.current.dataset.value = value;
              ref.current.dataset.label = label;
              ref.current.dataset.extra = extra ?? "";
              ref.current.dataset.descr = descr ?? "";
            } catch (err) {
              console.log(err);
            }
          }
        }
        e.target.dataset.value = newValues.join(",");
        if (onChange) onChange(e);
      };

      const filteredOptionsProp = (() => {
        if (typeof isFilter === "string" && isFilter.trim() !== "") {
          const filtrados = optionsProp.filter((opt) => {
            if (typeof opt !== "string") return false;
            const parts = opt.split("|");
            const filterValue = String(isFilter).trim();
            return parts[1] && parts[1].trim() === filterValue;
          });
          if (filtrados.length > 0) {
            const cabeceras = optionsProp.slice(0, 2);
            return [...cabeceras, ...filtrados];
          }
          return filtrados;
        }
        return optionsProp;
      })();

      const parsedOptions = filteredOptionsProp.map((opt) => {
        if (typeof opt === "string" && opt.includes("|")) {
          const parts = opt.split("|");
          const value = parts[0];
          const label = parts[parts.length - 1] ?? parts[0];
          return {
            value: String(value),
            label: String(label),
            raw: opt,
            parts,
          };
        } else if (typeof opt === "object" && opt.value && opt.label) {
          const raw = opt.raw ?? `${opt.value}|${opt.label}`;
          const parts = String(raw).split("|");
          return {
            value: String(opt.value ?? parts[0]),
            label: String(opt.label ?? parts[parts.length - 1]),
            raw,
            parts,
          };
        } else {
          const raw = String(opt);
          const parts = raw.split("|");
          return {
            value: String(parts[0]),
            label: parts[parts.length - 1] ?? parts[0],
            raw,
            parts,
          };
        }
      });

      const candidataRaw = String(datasetProps["data-value"] ?? "").trim();
      const candidataValor = String(datasetProps["data-valor"] ?? "").trim();
      const candidataDefault = String(restProps.defaultValue ?? "").trim();

      const candidatos = [
        candidataRaw,
        candidataValor,
        candidataDefault,
      ].filter(Boolean);

      const matchesCandidate = (hay) =>
        candidatos.some(
          (c) => String(hay ?? "").trim() === String(c ?? "").trim(),
        );

      const matchedOption = parsedOptions.find((opt) => {
        if (!opt) return false;
        if (matchesCandidate(opt.value)) return true;
        if (
          Array.isArray(opt.parts) &&
          opt.parts.some((p) => matchesCandidate(p))
        )
          return true;
        return false;
      });

      const displayOption = overrideOption ?? matchedOption;

      useEffect(() => {
        if (ref && ref.current && displayOption) {
          try {
            if (displayOption.value !== undefined) {
              ref.current.dataset.value = String(displayOption.value);
            }
            const maybeExtra = displayOption.parts?.[2] ?? displayOption.extra;
            if (maybeExtra !== undefined) {
              ref.current.dataset.extra = String(maybeExtra);
            }
          } catch (err) {
            console.log(err);
          }
        }
      }, [displayOption, ref]);

      useEffect(() => {
        if (hardcodedOption?.value) {
          setDataValue(hardcodedOption.value);
        } else {
          setDataValue("");
        }
      }, [hardcodedOption]);

      useEffect(() => {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(internalSelectRef.current);
        }
      }, [ref]);

      useEffect(() => {
        if (typeof usarHardcodedExterno === "boolean") {
          setUsarHardcoded(usarHardcodedExterno);
        }
      }, [usarHardcodedExterno]);

      const selectStyle =
        unaLinea === "1" ? { height: "2.7rem" } : { height: "10rem" };

      const configTable = {
        title: etiqueta,
        isPaginar: false,
        listaDatos: filteredOptionsProp,
        offsetColumnas: offsetColumnas ?? 1,
      };
      const popupWidth = ancho ? `${ancho}px` : "600px";

      return (
        <div className="block w-full">
          <label
            className="block w-3/4 mb-1 px-3 rounded-md border border-gray-400 bg-indigo-50 hover:bg-indigo-100 text-sm font-bold text-green-900 cursor-pointer shadow-sm transition"
            onClick={(e) => {
              if (props.popupTipo?.startsWith("99")) {
                setShowPopupEspecial(true);
                return;
              }
              const allow = props.onPopupClick ? props.onPopupClick(e) : true;
              if (allow === false) {
                setShowPopup(false);
                return;
              }
              setShowPopup(true);
            }}
          >
            <span className="text-sm font-bold text-green-900">
              {etiqueta} ( ... )
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </label>
          <select
            ref={ref} //internalSelectRef
            multiple
            readOnly
            disabled
            {...datasetProps}
            {...restProps}
            data-value={
              dataValue || displayOption?.value || datasetProps["data-value"]
            }
            onChange={handleChange}
            style={selectStyle}
            className="block w-full rounded-md border  px-3 py-2 shadow-sm opacity-50 cursor-not-allowed bg-gray-200 text-gray-700 font-bold"
            // className="block w-full rounded-md border px-3 py-2 shadow-sm bg-gray-200 text-gray-700 font-bold opacity-70 pointer-events-none cursor-not-allowed select-none"
          >
            {restProps.forcedOption && restProps?.optionFlag === 1 ? (
              <option
                key={restProps.forcedOption.value}
                value={restProps.forcedOption.value}
                style={{ fontWeight: "bold", color: "black" }}
              >
                {restProps.forcedOption.label}
              </option>
            ) : usarHardcoded && hardcodedOption ? (
              <option
                key={hardcodedOption.value}
                value={hardcodedOption.value}
                style={{ fontWeight: "bold", color: "black" }}
              >
                {hardcodedOption.label}
              </option>
            ) : displayOption ? (
              <option
                key={displayOption.value}
                value={displayOption.value}
                style={{ fontWeight: "bold", color: "black" }}
              >
                {displayOption.label}
              </option>
            ) : null}
          </select>

          {showPopup && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-white/0 backdrop-blur-sm z-50"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (props.onPopupClose && showPopup) {
                    try {
                      props.onPopupClose("cerrar", null);
                    } catch (err) {
                      console.warn(err);
                    }
                  }
                  setShowPopup(false);
                }
              }}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-h-[80vh] flex flex-col overflow-y-auto"
                style={{ width: popupWidth }}
              >
                <div className="mb-4 flex-1 min-h-0 overflow-y-auto pr-2">
                  {popupContent ?? (
                    <BaseTablaMatriz
                      configTable={configTable}
                      onSelect={(fila) => {
                        const value = fila[0];
                        const extra = fila?.[2] ?? "";
                        const descr = fila?.[3] ?? "";
                        const label = fila[fila.length - 1];
                        const { setSelectedItems } = useSelectStore.getState();
                        setSelectedItems([fila]);
                        setOverrideOption({ value, label, extra, descr });
                        if (typeof onPopupClose === "function") {
                          try {
                            props.onPopupClose("fila", value);
                          } catch (err) {
                            console.warn(err);
                          }
                        }
                        if (ref && ref.current) {
                          try {
                            ref.current.dataset.value = value;
                            ref.current.dataset.extra = extra;
                            ref.current.dataset.descr = descr;
                            ref.current.value = value;
                          } catch (err) {
                            console.log(err);
                          }
                        }
                        const fakeEvent = {
                          target: {
                            value,
                            dataset: { value, extra, descr },
                            option: { value, label, extra, descr },
                          },
                        };
                        if (onChange) onChange(fakeEvent);
                        setShowPopup(false);
                      }}
                    />
                  )}
                </div>
                <div className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md flex justify-end">
                  <button
                    onClick={() => {
                      if (props.onPopupClose) {
                        try {
                          props.onPopupClose("cerrar", null);
                        } catch (err) {
                          console.warn(err);
                        }
                      }
                      setShowPopup(false);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPopupEspecial && (
            <PopupBusqueda
              onClose={() => {
                const { selectedItems: currentItems } =
                  useSelectStore.getState();
                setShowPopupEspecial(false);
                setTimeout(() => {
                  if (currentItems && currentItems.length > 0) {
                    const fila = currentItems[0];
                    const valor = fila[0] ?? "";
                    const label = fila[1] ?? "";
                    restProps.setOptionFlag(0);
                    setUsarHardcoded(true);
                    setHardcodedOption({
                      value: valor ?? "",
                      label: label ?? "",
                    });
                    if (ref?.current) {
                      ref.current.dataset.value = valor ?? "";
                      ref.current.dataset.label = label ?? "";
                      ref.current.value = valor ?? "";
                      setDataValue(valor ?? "");
                    }
                    props.onPopupClose?.("cerrar", null);
                  }
                }, 0);
              }}
              etiqueta={etiqueta}
              ancho={ancho}
              listaDatos={optionsProp}
              onChange={handleChangeDesdePopup}
              parentRef={ref}
              ref={ref}
              url={props.url}
              offsetColumnas={offsetColumnas}
              triggerChange={(value, label) => {
                if (ref && ref.current) {
                  ref.current.dataset.value = value;
                  ref.current.dataset.label = label;
                  ref.current.value = value;
                  if (onChange) {
                    const fakeEvent = { target: ref.current };
                    onChange(fakeEvent);
                  }
                }
              }}
            />
          )}
        </div>
      );
    }

    if (Tag === "select") {
      const { etiqueta, onChange, children, isDefault, ...restProps } = props;
      const handleChange = (e) => {
        const value = e.target.value;
        e.target.dataset.value = value;
        if (onChange) onChange(e);
      };

      const handleRef = (el) => {
        if (ref) {
          if (typeof ref === "function") ref(el);
          else ref.current = el;
        }
        if (el && el.options.length > 0) {
          const currentValue = el.dataset.value || el.value;
          const match = Array.from(el.options).some(
            (opt) => opt.value === currentValue,
          );
          if (!match) {
            el.selectedIndex = 0;
            el.dataset.value = el.options[0].value;
            el.dataset.valor = el.options[0].value;
          }
        }
      };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                seleccione {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <select
            ref={handleRef}
            {...datasetProps}
            {...restProps}
            defaultValue={
              isDefault === 1
                ? (optionsProp?.[0]?.split("|")[0] ?? "")
                : (datasetProps["data-value"] ?? "")
            }
            onChange={handleChange}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-700 font-bold" : ""}`}
          >
            {isDefault !== 1 && (
              <option value="" disabled>
                Seleccione --
              </option>
            )}
            {children ??
              optionsProp.map((datos, idx) => {
                const [value, label] = datos.split("|");
                return (
                  <option key={idx} value={value}>
                    {label}
                  </option>
                );
              })}
          </select>
        </label>
      );
    }

    if (Tag === "selectMulti") {
      const { etiqueta, onChange, children, unaLinea, ...restProps } = props;
      const handleChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
          (opt) => opt.value,
        );
        e.target.dataset.value = selectedValues.join(",");
        if (onChange) onChange(e);
      };

      const selectStyle =
        unaLinea === "1" ? { height: "2.7rem" } : { height: "10rem" };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                seleccione {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <select
            ref={ref}
            multiple
            style={selectStyle}
            {...datasetProps}
            {...restProps}
            onChange={handleChange}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          >
            {children ??
              optionsProp.map(({ value, label }, idx) => (
                <option key={idx} value={value}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      );
    }

    if (Tag === "textArea") {
      const { etiqueta, onChange, ...restProps } = props;
      const handleChange = (e) => {
        e.target.dataset.value = e.target.value;
        if (onChange) onChange(e);
      };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <textarea
            ref={ref}
            {...datasetProps}
            {...restProps}
            onChange={handleChange}
            defaultValue={restProps.defaultValue}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          />
        </label>
      );
    }

    if (Tag === "button") {
      const {
        etiqueta,
        children,
        onClick,
        style = {},
        isEdit = true,
        ...restProps
      } = props;

      const isDisabledVisual = !isEdit;

      return (
        <div className="inline-block w-full">
          {etiqueta && (
            <span className="block text-sm font-bold text-green-900 mb-1">
              {etiqueta}
            </span>
          )}
          <button
            ref={ref}
            {...datasetProps}
            {...restProps}
            onClick={onClick}
            style={style}
            className={`
                      px-4 py-2 rounded-md shadow-sm
                      ${
                        isDisabledVisual
                          ? "bg-gray-300 text-gray-600  cursor-not-allowed opacity-50"
                          : "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                      }
                    `}
          >
            {children}
          </button>
        </div>
      );
    }
  },
);

export default CustomElement;
