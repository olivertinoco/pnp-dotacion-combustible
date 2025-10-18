import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import Loader from "./Loader";
import { useTablaVirtualizadaCustom } from "../hooks/useTablaVirtualizadaCustom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const Fila = memo(
  ({
    virtualRow,
    filaFiltrada,
    isEven,
    isSelected,
    effectiveWidth,
    cabeceraFiltrada,
    onClick,
    onDoubleClick,
  }) => (
    <div
      data-row-index={virtualRow.index}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`absolute left-0 flex border-b border-gray-200 cursor-pointer transition-colors duration-150 ${isSelected ? "bg-indigo-200" : isEven ? "bg-white" : "bg-gray-50"} hover:bg-indigo-100 active:bg-indigo-300`}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
        width: `${effectiveWidth}px`,
      }}
    >
      {filaFiltrada.map((val, j) => (
        <div
          key={j}
          className="px-2 py-2 text-left"
          style={{
            minWidth: `${cabeceraFiltrada[j][1]}px`,
            flexShrink: 0,
          }}
        >
          {val}
        </div>
      ))}
    </div>
  ),
);

export const BaseTablaMatriz = ({ configTable, onSelect }) => {
  const { title, isPaginar, listaDatos, offsetColumnas } = configTable;

  const rowsOriginal = listaDatos;

  const dataRows = useMemo(() => {
    return listaDatos && listaDatos.length > 2 ? listaDatos.slice(2) : [];
  }, [listaDatos]);

  // .... inicio de paginacion ....
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [containerWidth, setContainerWidth] = useState(null);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return dataRows;
    const lower = searchText.toLowerCase();
    return dataRows.filter((fila) => fila.toLowerCase().includes(lower));
  }, [dataRows, searchText]);

  const totalRegistrosFiltrados = useMemo(
    () => filteredRows.length,
    [filteredRows],
  );

  useEffect(() => {
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  useEffect(() => {
    if (isPaginar && page > totalPages) {
      setPage(totalPages);
    }
  }, [isPaginar, page, totalPages]);
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = filteredRows.slice(start, end);

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // ........ fin paginacion ....

  const datosTabla = useMemo(() => {
    const base = isPaginar ? paginatedRows : filteredRows;
    return base.map((fila) => {
      const partes = fila.split("|");
      return {
        completa: partes,
        visible: partes.slice(offsetColumnas),
      };
    });
  }, [isPaginar, paginatedRows, filteredRows, offsetColumnas]);

  const {
    totalRegistros,
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  } = useTablaVirtualizadaCustom(datosTabla, rowsOriginal, offsetColumnas);

  // --- NUEVO: calcular ancho dinámico del contenedor ---
  useEffect(() => {
    if (!tableContainerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [tableContainerRef]);
  // ------------------------------------------------------

  // NOTA: PARA RESALTADO DE LA FILA SELECCIONADA
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.key === "Enter" &&
        document.activeElement === searchInputRef.current
      ) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (rowVirtualizer.getTotalSize() === 0) return;
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          const next =
            prev === null
              ? 0
              : Math.min(prev + 1, rowVirtualizer.getTotalSize() - 1);
          rowVirtualizer.scrollToIndex(next, {
            align: "center",
            behavior: "smooth",
          });
          return next;
        });
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => {
          const next = prev === null ? 0 : Math.max(prev - 1, 0);
          rowVirtualizer.scrollToIndex(next, {
            align: "center",
            behavior: "smooth",
          });
          return next;
        });
        e.preventDefault();
      } else if (e.key === "Enter" && selectedIndex != null) {
        const filaSeleccionada = datosTabla[selectedIndex];
        if (filaSeleccionada && onSelect) {
          onSelect(filaSeleccionada.completa); // propaga el registro al padre
        }
        e.preventDefault();
      }
    },
    [rowVirtualizer, selectedIndex, datosTabla, onSelect],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (selectedIndex != null) {
      rowVirtualizer.scrollToIndex(selectedIndex, {
        align: "center",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, rowVirtualizer]);

  if (!listaDatos || listaDatos.length <= 1) {
    return <Loader />;
  }

  const effectiveWidth =
    containerWidth != null
      ? Math.max(containerWidth - 32, totalWidth)
      : totalWidth;

  return (
    <>
      <div
        ref={tableContainerRef}
        className="relative overflow-y-auto  min-h-0 bg-white shadow-lg rounded-lg border border-gray-200 outline-none"
        onScroll={() => syncScroll("table")}
        tabIndex={0}
      >
        {/* Título */}
        <div className="sticky top-0 left-0 z-30 bg-white shadow-md">
          <h2 className="text-left text-xl font-bold text-gray-800 py-2 px-4">
            {title}{" "}
            <span className="ml-2 text-sm font-medium text-gray-500">
              {`(${totalRegistrosFiltrados} Reg.)`}
            </span>
          </h2>
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  tableContainerRef.current?.focus();
                  setSelectedIndex(0); // opcional: empezar desde el primer resultado
                }
              }}
              ref={searchInputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                          text-sm text-gray-700"
            />
          </div>
        </div>

        {/* Cabecera fija */}
        <div
          className="sticky top-10 z-20 flex border-b border-gray-300 bg-gray-100"
          style={{ width: `${effectiveWidth}px` }}
        >
          {cabeceraFiltrada.map((col, id) => (
            <div
              key={id}
              className="px-2 py-2 font-semibold text-left"
              style={{
                minWidth: `${col[1]}px`,
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
            height: isPaginar
              ? `${rowVirtualizer.getVirtualItems().length * 35}px`
              : `${rowVirtualizer.getTotalSize()}px`,
            width: `${effectiveWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const filaItem = datosTabla[virtualRow.index];
            if (!filaItem) return null;
            return (
              <Fila
                key={virtualRow.index}
                virtualRow={virtualRow}
                filaFiltrada={filaItem.visible}
                isEven={virtualRow.index % 2 === 0}
                isSelected={virtualRow.index === selectedIndex}
                effectiveWidth={effectiveWidth}
                cabeceraFiltrada={cabeceraFiltrada}
                onClick={() => {
                  setSelectedIndex(virtualRow.index);
                  rowVirtualizer.scrollToIndex(virtualRow.index, {
                    align: "center",
                    behavior: "smooth",
                  });
                }}
                onDoubleClick={() => {
                  setSelectedIndex(virtualRow.index);
                  if (filaItem && onSelect) {
                    onSelect(filaItem.completa);
                  }
                }}
              />
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
        <div className="h-1" style={{ width: `${effectiveWidth}px` }}></div>
      </div>

      {isPaginar && (
        <Stack spacing={2} className="mt-4 flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            color="primary"
          />
        </Stack>
      )}
    </>
  );
};
