import axios from "axios";

const BASE_URL = "http://localhost:8080/api/generador";

export const obtenerValidacionGenerador = async (idPeriodoAcademico) => {
  const response = await axios.get(
    `${BASE_URL}/validacion-previa/${idPeriodoAcademico}`
  );
  return response.data;
};

export const obtenerInputGenerador = async (idPeriodoAcademico) => {
  const response = await axios.get(`${BASE_URL}/input/${idPeriodoAcademico}`);
  return response.data;
};

export const ejecutarGenerador = async (idPeriodoAcademico) => {
  const response = await axios.post(`${BASE_URL}/ejecutar/${idPeriodoAcademico}`);
  return response.data;
};
