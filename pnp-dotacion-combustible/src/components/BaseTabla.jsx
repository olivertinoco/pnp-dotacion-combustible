import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Loader from "../components/Loader";
import { useData } from "../context/DataProvider";

export const BaseTabla = ({ tipo, title }) => {
  const { listaDotacion, listaVehiculo } = useData();
  const scrollBarRef = useRef(null);
  const rows = tipo === "dotacion" ? listaDotacion : listaVehiculo;

  const titulo = useMemo(
    () => (rows && rows.length > 1 ? rows[0].split("|") : []),
    [rows],
  );

  const cabecera = useMemo(() => {
    if (rows && rows.length > 1) {
      return rows[1].split("|").map((val, i) => [titulo[i], Number(val)]);
    }
    return [];
  }, [rows, titulo]);

  const totalWidth = useMemo(
    () => cabecera.reduce((acc, col) => acc + col[1], 0),
    [cabecera],
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

  const totalRegistros = rows.length > 2 ? rows.length - 2 : 0;

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
          {cabecera.map((col, id) => (
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

            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 flex border-b border-gray-200"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  width: `${totalWidth}px`,
                }}
              >
                {cabecera.map((col, j) => (
                  <div
                    key={j}
                    className="px-2 py-2 text-left truncate"
                    style={{
                      width: `${col[1]}px`,
                      minWidth: `${col[1]}px`,
                      maxWidth: `${col[1]}px`,
                      flexShrink: 0,
                    }}
                  >
                    {oneRow[j]}
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
    </>
  );
};
