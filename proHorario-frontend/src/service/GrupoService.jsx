import { createCatalogService } from "./CrearService";

const grupoService = createCatalogService("http://localhost:8080/api/grupos");

export const crearGrupo = grupoService.create;
export const obtenerGrupos = grupoService.list;