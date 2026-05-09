import { createCatalogService } from "./CrearService";

const aulaService = createCatalogService("http://localhost:8080/api/aulas");

export const crearAula = aulaService.create;
export const obtenerAulas = aulaService.list;
