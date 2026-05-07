import axios from "axios";

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
  };
}
