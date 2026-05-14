import { createCatalogService } from "./CrearService";

const sesionClaseService = createCatalogService(
  "http://localhost:8080/api/sesion_clase"
);

export const crearSesionClase = sesionClaseService.create;
export const obtenerSesionClase = sesionClaseService.list;
