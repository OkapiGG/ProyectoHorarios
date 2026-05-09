import { createCatalogService } from "./CrearService";

const planEstudioDetalleService = createCatalogService("http://localhost:8080/api/plan_detalle");

export const crearPlanEstudioDetalle = planEstudioDetalleService.create;
export const listarPlanEstudioDetalle = planEstudioDetalleService.list;