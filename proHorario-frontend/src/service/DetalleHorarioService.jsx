import axios from "axios";
import { createCatalogService } from "./CrearService";

const BASE_URL = "http://localhost:8080/api/detalle_horario";
const detalleHorario = createCatalogService(BASE_URL);

export const obtenerDetalleHorarioPorPropuesta = async (idProDisponibilidad) => {
  const response = await axios.get(`${BASE_URL}/propuesta/${idProDisponibilidad}`);
  return response.data;
};

export const crearDetalleHorario = async (payload) => {
  const response = await axios.post(BASE_URL, payload);
  return response.data;
};

export const actualizarDetalleHorario = async (idDetalleHorario, payload) => {
  const response = await axios.put(`${BASE_URL}/${idDetalleHorario}`, payload);
  return response.data;
};

export const eliminarDetalleHorario = async (idDetalleHorario) => {
  await axios.delete(`${BASE_URL}/${idDetalleHorario}`);
};

export const obtenerDetalleHorario = detalleHorario.list;
