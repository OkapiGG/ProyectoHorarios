import { createCatalogService } from "./CrearService";
import axios from "axios";

const grupoAulaService = createCatalogService("http://localhost:8080/api/grupo_aula");

export const crearGrupoAula = grupoAulaService.create;
export const obtenerGrupoAula = grupoAulaService.list;
export const obtenerGrupoAulaPorPeriodo = async (idPeriodoAcademico) => {
  const response = await axios.get(
    `http://localhost:8080/api/grupo_aula/periodo/${idPeriodoAcademico}`
  );
  return response.data;
};
