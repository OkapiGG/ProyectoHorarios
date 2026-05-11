import { createCatalogService } from "./CrearService";

const detalleHorario = createCatalogService(
  "http://localhost:8080/api/detalle_horario"
);

export const crearDetalleHorario = detalleHorario.create;
export const obtenerDetalleHorario = detalleHorario.list;
