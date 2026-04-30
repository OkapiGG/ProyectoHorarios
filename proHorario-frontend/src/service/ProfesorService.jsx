import axios from "axios";

const API_URL = "http://localhost:8080/api/profesores";

export const crearProfesor = async (profesorData) => {
    try{
        const response = await axios.post(API_URL, profesorData);
        return response.data
    } catch(error){
        console.error("Error al crear el Profesor:", error);
        throw error;
    }
};

export const obtenerProfesor = async () => {
    try{
        const response = await axios.get(API_URL);
        return response.data
    } catch(error) {
        console.error("Error al obtener el Profesor");
        throw error;
    }
};