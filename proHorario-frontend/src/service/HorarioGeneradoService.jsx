import axios from "axios";

const BASE_URL = "http://localhost:8080/api/sesion_clase";

export const obtenerHorarioGeneradoPorPeriodo = async (idPeriodoAcademico) => {
  const response = await axios.get(
    `${BASE_URL}/periodo/${idPeriodoAcademico}/visualizacion`
  );
  return response.data;
};
