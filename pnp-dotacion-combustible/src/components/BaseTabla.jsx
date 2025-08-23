import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import Popup from "../components/Popup";
import { useFiltradoSincronizado } from "../hooks/useFiltradoSincronizado";
import { useTablaVirtualizada } from "../hooks/useTablaVirtualizada";
import { useExportExcel } from "../hooks/useExportExcel";
import { getTimestamp } from "../utils/getTimestamp";
import { useData } from "../context/DataProvider";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export const BaseTabla = ({
  tipo,
  title,
  buscar,
  exportExcel,
  setExportExcel,
}) => {
  const { listaDotacion, listaVehiculo } = useData();
  const rowsOriginal = tipo === "vehiculo" ? listaVehiculo : listaDotacion;

  const rows = useFiltradoSincronizado(
    rowsOriginal,
    buscar,
    tipo,
    listaVehiculo,
  );

  //la paginacion aqui
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    setPage(1);
  }, [buscar]);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = rows.slice(start, end);

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
  } = useTablaVirtualizada(paginatedRows, rowsOriginal, tipo, buscar);
  // } = useTablaVirtualizada(rows, rowsOriginal, tipo, buscar);

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
              ({rows.length - 2} vehiculos)
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
            // height: `${rowVirtualizer.getTotalSize()}px`,
            height: `${rowVirtualizer.getVirtualItems().length * 35}px`,
            width: `${totalWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            // const fila = rows[virtualRow.index + 2];
            const fila = paginatedRows[virtualRow.index + 2];
            if (!fila) return null;
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

      <Stack spacing={2} className="mt-4 flex justify-center">
        <Pagination
          count={Math.ceil(rows.length / rowsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          shape="rounded"
          color="primary"
        />
      </Stack>

      <Popup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title="Sin datos encontrados"
        message="No existen registros que coincidan con tu búsqueda."
      />
    </>
  );
};
