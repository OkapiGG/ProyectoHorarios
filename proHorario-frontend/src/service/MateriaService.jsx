import axios from "axios";

const API_URL = "http://localhost:8080/api/materias";

export const crearMateria = async (materiaData) => {
  try {
    const response = await axios.post(API_URL, materiaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la Materia:", error);
    throw error;
  }
};

export const obtenerMateria = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las Materias:", error);
    throw error;
  }
};
