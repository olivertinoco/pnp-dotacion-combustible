import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const useExportExcel = () => {
  const exportToExcel = (rows, fileName, tipo = "vehiculo") => {
    if (!rows || rows.length === 0) return;

    const header = rows[0]?.split("|") ?? [];
    const headerProcessed = tipo === "vehiculo" ? header.slice(3) : header;

    // filas de datos desde la tercera fila en adelante
    const data = rows.slice(2).map((row) => {
      const columnas = row.split("|");
      return tipo === "vehiculo" ? columnas.slice(3) : columnas;
    });

    const parsedData = [headerProcessed, ...data].filter(
      (arr) => Array.isArray(arr) && arr.length > 0,
    );

    if (parsedData.length === 0) return; // nada que exportar

    // creamos la hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(parsedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // generar en memoria como ArrayBuffer
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    // crear blob y disparar descarga
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  return { exportToExcel };
};
