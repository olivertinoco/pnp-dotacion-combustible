import { useMemo } from "react";

export function useFiltradoSincronizado(
  rowsOriginal,
  buscar,
  tipo,
  listaVehiculo,
) {
  return useMemo(() => {
    if (!rowsOriginal || rowsOriginal.length === 0) return [];

    const { tipoRegistro, tipoFuncion, tipoVehiculo, placaInterna } =
      buscar || {};
    const hayFiltros = [
      tipoRegistro,
      tipoFuncion,
      tipoVehiculo,
      placaInterna,
    ].some((v) => !!(v && String(v).trim() !== ""));

    // Función auxiliar: aplica filtros básicos de vehículo
    const cumpleVehiculo = (cols) => {
      if (tipoRegistro && cols[0] !== tipoRegistro.trim()) return false;
      if (tipoFuncion && cols[1] !== tipoFuncion.trim()) return false;
      if (tipoVehiculo && cols[2] !== tipoVehiculo.trim()) return false;
      if (placaInterna) {
        const c5 = (cols[5] ?? "").toString();
        if (!c5.toUpperCase().startsWith(placaInterna.toUpperCase()))
          return false;
      }
      return true;
    };

    // === Caso VEHICULO ===
    if (tipo === "vehiculo") {
      if (!hayFiltros) return rowsOriginal;
      const filtrados = rowsOriginal.filter((fila, idx) => {
        if (idx < 2) return true; //mantener cabecera
        const cols = fila.split("|");
        return cumpleVehiculo(cols);
      });
      return filtrados.length > 2 ? filtrados : rowsOriginal.slice(0, 2);
    }

    // === Caso DOTACION ===
    if (tipo === "dotacion") {
      if (!hayFiltros) return rowsOriginal;

      // 1) Filtrar listaVehiculo
      const vehiculosFiltrados = (listaVehiculo || []).filter((fila, idx) => {
        if (idx < 2) return false; //saltar cabecera
        const cols = fila.split("|");
        return cumpleVehiculo(cols);
      });

      // 2) Construir set de códigos comunes (vehiculo[4])
      const codigosVehiculo = new Set(
        vehiculosFiltrados.map((f) =>
          (f.split("|")[4] ?? "").trim().toUpperCase(),
        ),
      );

      // 3) Filtrar dotación por el campo común (dotacion[2])
      const filtradosDotacion = rowsOriginal.filter((fila, idx) => {
        if (idx < 2) return true; //mantener cabeceras
        const cod = (fila.split("|")[2] ?? "").trim().toUpperCase();
        return codigosVehiculo.has(cod);
      });

      return filtradosDotacion.length > 2
        ? filtradosDotacion
        : rowsOriginal.slice(0, 2);
    }

    return rowsOriginal;
  }, [rowsOriginal, buscar, tipo, listaVehiculo]);
}
