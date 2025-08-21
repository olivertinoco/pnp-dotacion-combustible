import { useRef, useMemo, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Loader from "../components/Loader";
import Popup from "../components/Popup";
import { useData } from "../context/DataProvider";

export const BaseTabla = ({ tipo, title, buscar }) => {
  const { listaDotacion, listaVehiculo } = useData();
  const [showPopup, setShowPopup] = useState(false);
  const scrollBarRef = useRef(null);

  const rowsOriginal = tipo === "dotacion" ? listaDotacion : listaVehiculo;

  const rows = useMemo(() => {
    if (!rowsOriginal) return [];
    if (tipo === "dotacion") return rowsOriginal;
    const { tipoRegistro, tipoFuncion, tipoVehiculo, placaInterna } =
      buscar || {};
    if (
      ![tipoRegistro, tipoFuncion, tipoVehiculo, placaInterna].some(Boolean)
    ) {
      return rowsOriginal;
    }
    const filtrados = rowsOriginal.filter((fila, idx) => {
      if (idx < 2) return true;
      const cols = fila.split("|");

      if (tipoRegistro && cols[0] !== tipoRegistro.trim()) return false;
      if (tipoFuncion && cols[1] !== tipoFuncion.trim()) return false;
      if (tipoVehiculo && cols[2] !== tipoVehiculo.trim()) return false;

      if (placaInterna) {
        const c5 = (cols[5] ?? "").toString();
        if (!c5.toUpperCase().startsWith(placaInterna.toUpperCase()))
          return false;
      }
      return true;
    });

    if (filtrados.length <= 2) {
      return rowsOriginal.slice(0, 2);
    }
    return filtrados;
  }, [rowsOriginal, buscar, tipo]);

  const totalRegistros = rows.length > 2 ? rows.length - 2 : 0;

  useEffect(() => {
    setShowPopup(totalRegistros === 0);
  }, [totalRegistros, buscar]);

  const titulo = useMemo(
    () =>
      rowsOriginal && rowsOriginal.length > 1 ? rowsOriginal[0].split("|") : [],
    [rowsOriginal],
  );

  const cabecera = useMemo(() => {
    if (rowsOriginal && rowsOriginal.length > 1) {
      return rowsOriginal[1]
        .split("|")
        .map((val, i) => [titulo[i], Number(val)]);
    }
    return [];
  }, [rowsOriginal, titulo]);

  const cabeceraFiltrada = useMemo(() => {
    return tipo === "dotacion" ? cabecera : cabecera.slice(3);
  }, [cabecera, tipo]);

  const totalWidth = useMemo(
    () => cabeceraFiltrada.reduce((acc, col) => acc + col[1], 0),
    [cabeceraFiltrada],
  );

  const tableContainerRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length - 2,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
  });

  const syncScroll = (source) => {
    if (!tableContainerRef.current || !scrollBarRef.current) return;
    window.requestAnimationFrame(() => {
      if (source === "table") {
        scrollBarRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
      } else {
        tableContainerRef.current.scrollLeft = scrollBarRef.current.scrollLeft;
      }
    });
  };

  if (!rows || rows.length <= 1) {
    return <Loader />;
  }

  return (
    <>
      <div
        ref={tableContainerRef}
        className="relative overflow-auto max-h-[90vh] bg-white shadow-lg rounded-lg border border-gray-200"
        onScroll={() => syncScroll("table")}
      >
        {/* Título */}
        <div className="sticky top-0 left-0 z-30 bg-white shadow-md">
          <h2 className="text-left text-xl font-bold text-gray-800 py-2 px-4">
            {title}{" "}
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({totalRegistros} vehiculos)
            </span>
          </h2>
        </div>

        {/* Cabecera fija */}
        <div
          className="sticky top-10 z-20 flex border-b border-gray-300 bg-gray-100"
          style={{ width: `${totalWidth}px` }}
        >
          {cabeceraFiltrada.map((col, id) => (
            <div
              key={id}
              className="px-2 py-2 font-semibold text-left"
              style={{
                width: `${col[1]}px`,
                minWidth: `${col[1]}px`,
                maxWidth: `${col[1]}px`,
                flexShrink: 0,
              }}
            >
              {col[0]}
            </div>
          ))}
        </div>

        {/* Body virtualizado */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${totalWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const fila = rows[virtualRow.index + 2];
            const oneRow = fila.split("|");
            const filaFiltrada = tipo === "dotacion" ? oneRow : oneRow.slice(3);

            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 flex border-b border-gray-200"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  width: `${totalWidth}px`,
                }}
              >
                {filaFiltrada.map((val, j) => (
                  <div
                    key={j}
                    className="px-2 py-2 text-left truncate"
                    style={{
                      width: `${cabeceraFiltrada[j][1]}px`,
                      minWidth: `${cabeceraFiltrada[j][1]}px`,
                      maxWidth: `${cabeceraFiltrada[j][1]}px`,
                      flexShrink: 0,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de scroll sincronizada */}
      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100"
        onScroll={() => syncScroll("bar")}
      >
        <div className="h-1" style={{ width: `${totalWidth}px` }}></div>
      </div>

      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Sin datos encontrados"
        message="No existen registros que coincidan con tu búsqueda."
      />
    </>
  );
};
