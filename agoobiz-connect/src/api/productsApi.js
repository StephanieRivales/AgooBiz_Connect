import api from "./api";

// Centralizes every product-related API call so pages don't repeat fetch logic.
export const productsApi = {
  getAll: async (params = {}) => {
    const res = await api.get("/products", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  create: async (productData) => {
    const res = await api.post("/products", productData);
    return res.data;
  },

  update: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};