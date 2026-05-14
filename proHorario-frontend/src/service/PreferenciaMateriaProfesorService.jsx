import axios from "axios";

const API_URL = "http://localhost:8080/api/preferencias-materia-profesor";

export const listarPreferenciasMateriaProfesor = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const listarPreferenciasPorProfesor = async (idProfesor) => {
  const response = await axios.get(`${API_URL}/profesor/${idProfesor}`);
  return response.data;
};

export const listarPreferenciasPorProfesorYPeriodo = async (
  idProfesor,
  idPeriodoAcademico
) => {
  const response = await axios.get(
    `${API_URL}/profesor/${idProfesor}/periodo/${idPeriodoAcademico}`
  );
  return response.data;
};

export const crearPreferenciaMateriaProfesor = async (payload) => {
  const response = await axios.post(API_URL, payload);
  return response.data;
};

export const actualizarPreferenciaMateriaProfesor = async (
  idPreferenciaMateria,
  payload
) => {
  const response = await axios.put(`${API_URL}/${idPreferenciaMateria}`, payload);
  return response.data;
};

export const eliminarPreferenciaMateriaProfesor = async (idPreferenciaMateria) => {
  await axios.delete(`${API_URL}/${idPreferenciaMateria}`);
};
