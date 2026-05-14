import { createCatalogService } from "./CrearService";

const cargaAcademicaService = createCatalogService(
  "http://localhost:8080/api/carga_academica"
);

export const crearCargaAcademica = cargaAcademicaService.create;
export const obtenerCargasAcademicas = cargaAcademicaService.list;
export const actualizarCargaAcademica = cargaAcademicaService.update;
export const eliminarCargaAcademica = cargaAcademicaService.remove;
