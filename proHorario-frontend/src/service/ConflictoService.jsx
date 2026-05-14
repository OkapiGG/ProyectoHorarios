import axios from "axios";

const BASE_URL = "http://localhost:8080/api/conflictos";

export const obtenerConflictosPendientes = async (idPeriodo) => {
  const response = await axios.get(`${BASE_URL}/periodo/${idPeriodo}`);
  return response.data;
};

export const obtenerConflictosTodos = async (idPeriodo) => {
  const response = await axios.get(`${BASE_URL}/periodo/${idPeriodo}/todos`);
  return response.data;
};

export const obtenerSugerencias = async (idConflicto) => {
  const response = await axios.get(`${BASE_URL}/${idConflicto}/sugerencias`);
  return response.data;
};

export const aplicarSugerencia = async (idConflicto, sugerencia) => {
  const payload = {
    idConflicto,
    tipo: sugerencia.tipo,
    cambios: sugerencia.cambios,
  };
  const response = await axios.post(`${BASE_URL}/${idConflicto}/aplicar`, payload);
  return response.data;
};

export const descartarConflicto = async (idConflicto, motivo) => {
  const response = await axios.patch(`${BASE_URL}/${idConflicto}/descartar`, {
    motivo: motivo ?? null,
  });
  return response.data;
};
