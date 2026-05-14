import axios from "axios";
import { createCatalogService } from "./CrearService";

const BASE_URL = "http://localhost:8080/api/sesion_clase";

const sesionClaseService = createCatalogService(BASE_URL);

export const crearSesionClase = sesionClaseService.create;
export const obtenerSesionClase = sesionClaseService.list;

/**
 * Mueve una sesion logica al nuevo bloque inicial y/o aula.
 * Recibe { idComponente, numeroSesion, idBloqueInicialNuevo, idAulaNueva }.
 * 409 si hay choque con el grid actual.
 */
export const moverSesionLogica = async (payload) => {
  const response = await axios.patch(`${BASE_URL}/logica`, payload);
  return response.data;
};

/**
 * Elimina por completo la sesion logica (libera todos sus bloques).
 */
export const eliminarSesionLogica = async (idComponente, numeroSesion) => {
  await axios.delete(`${BASE_URL}/logica`, {
    params: { idComponente, numeroSesion },
  });
};
