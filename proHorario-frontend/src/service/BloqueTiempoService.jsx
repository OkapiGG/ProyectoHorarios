import { createCatalogService } from "./CrearService";

const bloqueTiempoService = createCatalogService(
  "http://localhost:8080/api/bloque_tiempo"
);

export const crearBloqueTiempo = bloqueTiempoService.create;
export const obtenerBloquesTiempo = bloqueTiempoService.list;
export const obtenerBloqueTiempo = bloqueTiempoService.list;
