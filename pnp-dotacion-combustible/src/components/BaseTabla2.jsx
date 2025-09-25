import { useState, useEffect, useMemo } from "react";
import { Loader, Popup } from "../components";
import {
  useFiltradoSincronizado,
  useTablaVirtualizada,
  useExportExcel,
} from "../hooks";
import { getTimestamp } from "../utils/getTimestamp";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useData } from "../context/DataProviderDotacion";

export const BaseTabla2 = ({ configTable }) => {
  const { tipo, title, buscar, exportExcel, setExportExcel, isPaginar } =
    configTable;

  const { listaDotacion, listaVehiculo, listaOperatividad } = useData();
  // const rowsOriginal = tipo === "operativo" ? listaOperatividad : "";

  const rowsOriginal = useMemo(() => {
    switch (tipo) {
      case "dotacion":
        return listaDotacion;
      case "vehiculo":
        return listaVehiculo;
      case "operativo":
        return listaOperatividad;
      default:
        return [];
    }
  }, [tipo, listaDotacion, listaVehiculo, listaOperatividad]);

  const rows = useFiltradoSincronizado(
    rowsOriginal,
    buscar,
    tipo,
    tipo === "operativo" ? listaOperatividad : listaVehiculo,
  );

  const dataRows = rows && rows.length > 2 ? rows.slice(2) : [];

  // .... inicio de paginacion ....
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    setPage(1);
  }, [buscar]);

  const totalPages = Math.max(1, Math.ceil(dataRows.length / rowsPerPage));
  useEffect(() => {
    if (isPaginar && page > totalPages) {
      setPage(totalPages);
    }
  }, [isPaginar, page, totalPages]);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = dataRows.slice(start, end);

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // ........ fin paginacion ....

  const datosTabla = isPaginar ? paginatedRows : rows;
  const {
    showPopup,
    setShowPopup,
    totalRegistros,
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  } = useTablaVirtualizada(datosTabla, rowsOriginal, tipo, buscar);

  const { exportToExcel } = useExportExcel();
  useEffect(() => {
    if (exportExcel) {
      const baseName = tipo === "vehiculo" ? "prog-vehiculos" : "prog-dotacion";
      const timestamp = getTimestamp();
      const fileName = `${baseName}.${timestamp}.xlsx`;

      exportToExcel(rowsOriginal, fileName, tipo);
      setExportExcel(false);
    }
  }, [exportExcel, rowsOriginal, tipo, exportToExcel, setExportExcel]);

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
              {isPaginar
                ? `(${rows.length - 2} vehiculos)`
                : `(${totalRegistros} vehiculos)`}
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
            height: isPaginar
              ? `${rowVirtualizer.getVirtualItems().length * 35}px`
              : `${rowVirtualizer.getTotalSize()}px`,
            width: `${totalWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const base = isPaginar ? 0 : 2;
            const fila = datosTabla[virtualRow.index + base];
            if (!fila) return null;
            const oneRow = fila.split("|");
            const filaFiltrada =
              tipo === "dotacion" || tipo === "operativo"
                ? oneRow
                : oneRow.slice(3);

            const isEven = virtualRow.index % 2 === 0;
            return (
              <div
                key={virtualRow.index}
                className={`absolute left-0 flex border-b border-gray-200 cursor-pointe ${isEven ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150`}
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
      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Sin datos encontrados"
        message="No existen registros que coincidan con tu búsqueda."
      />
    </>
  );
};
