import { createCatalogService } from "./CrearService";
import axios from "axios";

const periodoAcademicoService = createCatalogService("http://localhost:8080/api/periodos_academicos");

export const crearPeriodoAcademico = periodoAcademicoService.create;
export const obtenerPeriodoAcademico = periodoAcademicoService.list;
export const actualizarPeriodoAcademico = periodoAcademicoService.update;
export const eliminarPeriodoAcademico = periodoAcademicoService.remove;
export const obtenerPeriodoActivo = async () => {
  const response = await axios.get("http://localhost:8080/api/periodos_academicos/activo");
  return response.data;
};
