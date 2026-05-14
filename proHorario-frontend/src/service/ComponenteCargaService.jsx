import { createCatalogService } from "./CrearService";

const componenteCargaService = createCatalogService(
  "http://localhost:8080/api/componente_carga"
);

export const crearComponenteCarga = componenteCargaService.create;
export const obtenerComponentesCarga = componenteCargaService.list;
export const actualizarComponenteCarga = componenteCargaService.update;
export const eliminarComponenteCarga = componenteCargaService.remove;
