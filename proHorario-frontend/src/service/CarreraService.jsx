import { createCatalogService } from "./CrearService";

const carreraService = createCatalogService("http://localhost:8080/api/carreras")

export const crearCarrera = carreraService.create;
export const obtenerCarreras = carreraService.list;