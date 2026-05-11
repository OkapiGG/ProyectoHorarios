import { createCatalogService } from "./CrearService";

const bloqueTiempoService = createCatalogService("http://localhost:8080/api/bloque_tiempo");

export const obtenerBloquesTiempo = bloqueTiempoService.list;
export const crearBloqueTiempo = bloqueTiempoService.create;
