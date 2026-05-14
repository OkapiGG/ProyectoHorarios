import { createCatalogService } from "./CrearService";

const edificioService = createCatalogService("http://localhost:8080/api/edificios");

export const obtenerEdificios = edificioService.list;
export const obtenerEdificio = obtenerEdificios;
export const crearEdificio = edificioService.create;
export const actualizarEdificio = edificioService.update;
export const eliminarEdificio = edificioService.remove;
