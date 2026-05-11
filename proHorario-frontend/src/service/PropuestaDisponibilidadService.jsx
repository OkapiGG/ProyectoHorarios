import axios from "axios";

const BASE_URL = "http://localhost:8080/api/propuestas";

export const obtenerPropuestaPorProfesorYPeriodo = async (idProfesor, idPeriodoAcademico) => {
  const response = await axios.get(
    `${BASE_URL}/profesor/${idProfesor}/periodo/${idPeriodoAcademico}`
  );

  return response.data;
};

export const crearPropuestaDisponibilidad = async (payload) => {
  const response = await axios.post(BASE_URL, payload);
  return response.data;
};

export const resolverPropuestaDisponibilidad = async (idProfesor, idPeriodoAcademico) => {
  try {
    return await obtenerPropuestaPorProfesorYPeriodo(idProfesor, idPeriodoAcademico);
  } catch (error) {
    if (error.response?.status === 404) {
      return crearPropuestaDisponibilidad({
        idProfesor,
        idPeriodoAcademico,
      });
    }

    throw error;
  }
};

export const enviarPropuesta = async (idPropuesta) => {
  const response = await axios.put(`${BASE_URL}/${idPropuesta}/enviar`);
  return response.data;
};

export const obtenerPropuestasPorEstado = async (estado, idPeriodoAcademico) => {
  const response = await axios.get(`${BASE_URL}/estado/${estado}`, {
    params: idPeriodoAcademico ? { idPeriodoAcademico } : {},
  });

  return response.data;
};

export const obtenerPropuestaCoordinacionPorId = async (idPropuesta) => {
  const response = await axios.get(`${BASE_URL}/${idPropuesta}/coordinacion`);
  return response.data;
};

export const obtenerPropuestasPorProfesor = async (idProfesor, estado) => {
  const response = await axios.get(`${BASE_URL}/profesor/${idProfesor}`, {
    params: estado ? { estado } : {},
  });

  return response.data;
};

export const aprobarPropuesta = async (idPropuesta) => {
  const response = await axios.put(`${BASE_URL}/${idPropuesta}/aprobar`);
  return response.data;
};

export const rechazarPropuesta = async (idPropuesta) => {
  const response = await axios.put(`${BASE_URL}/${idPropuesta}/rechazar`);
  return response.data;
};
