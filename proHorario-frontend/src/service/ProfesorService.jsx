import { createCatalogService } from "./CrearService";

const profesorService = createCatalogService("http://localhost:8080/api/profesores");

export const crearProfesor = profesorService.create;
export const obtenerProfesor = profesorService.list;
