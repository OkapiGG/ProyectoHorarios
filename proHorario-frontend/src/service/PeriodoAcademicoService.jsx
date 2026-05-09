import { createCatalogService } from "./CrearService";

const periodoAcademicoService = createCatalogService("http://localhost:8080/api/periodos_academicos");

export const crearPeriodoAcademico = periodoAcademicoService.create;
export const obtenerPeriodoAcademico = periodoAcademicoService.list;