import { createCatalogService } from "./CrearService";
import axios from "axios";

const periodoAcademicoService = createCatalogService("http://localhost:8080/api/periodos_academicos");

export const crearPeriodoAcademico = periodoAcademicoService.create;
export const obtenerPeriodoAcademico = periodoAcademicoService.list;
export const obtenerPeriodoActivo = async () => {
  const response = await axios.get("http://localhost:8080/api/periodos_academicos/activo");
  return response.data;
};
