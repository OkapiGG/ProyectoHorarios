import axios from "axios";

/**
 * Factory para servicios de catálogos CRUD. Provee:
 *  - list()           GET    /baseUrl
 *  - create(payload)  POST   /baseUrl
 *  - update(id, p)    PUT    /baseUrl/{id}
 *  - remove(id)       DELETE /baseUrl/{id}
 */
export function createCatalogService(baseUrl) {
  return {
    list: async () => {
      const response = await axios.get(baseUrl);
      return response.data;
    },
    create: async (payload) => {
      const response = await axios.post(baseUrl, payload);
      return response.data;
    },
    update: async (id, payload) => {
      const response = await axios.put(`${baseUrl}/${id}`, payload);
      return response.data;
    },
    remove: async (id) => {
      await axios.delete(`${baseUrl}/${id}`);
    },
  };
}
