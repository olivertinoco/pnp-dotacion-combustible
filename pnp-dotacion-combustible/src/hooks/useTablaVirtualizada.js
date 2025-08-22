import { useMemo, useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export const useTablaVirtualizada = (rows, rowsOriginal, tipo, buscar) => {
  const [showPopup, setShowPopup] = useState(false);
  const scrollBarRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Total de registros (excluyendo cabeceras)
  const totalRegistros = rows.length > 2 ? rows.length - 2 : 0;

  useEffect(() => {
    setShowPopup(totalRegistros === 0);
  }, [totalRegistros, buscar]);

  // Títulos
  const titulo = useMemo(
    () =>
      rowsOriginal && rowsOriginal.length > 1 ? rowsOriginal[0].split("|") : [],
    [rowsOriginal],
  );

  // Cabecera
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

  // Virtualizador
  const rowVirtualizer = useVirtualizer({
    count: rows.length - 2,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
  });

  // Scroll sincronizado
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

  return {
    showPopup,
    setShowPopup,
    totalRegistros,
    titulo,
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  };
};
