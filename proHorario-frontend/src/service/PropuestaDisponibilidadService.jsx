import { createCatalogService } from "./CrearService";

const propuestaDisponibilidadService = createCatalogService(
  "http://localhost:8080/api/propuestas"
);

export const crearPropuestaDisponibilidad = propuestaDisponibilidadService.create;
export const obtenerPropuestaDisponibilidad = propuestaDisponibilidadService.list;
