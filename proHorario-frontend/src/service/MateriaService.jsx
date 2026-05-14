import { createCatalogService } from "./CrearService";

const materiaService = createCatalogService("http://localhost:8080/api/materias");

export const crearMateria = materiaService.create;
export const listarMaterias = materiaService.list;
export const actualizarMateria = materiaService.update;
export const eliminarMateria = materiaService.remove;
