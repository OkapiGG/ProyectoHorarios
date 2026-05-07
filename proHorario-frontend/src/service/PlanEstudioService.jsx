import { createCatalogService } from "./CrearService";

const planEstudio = createCatalogService("http://localhost:8080/api/plan_estudio");

export const obtenerPlanEstudio = planEstudio.list;
export const crearPlanEstudio = planEstudio.create;
