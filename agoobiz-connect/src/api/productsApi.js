import api from "./api";

// Centralizes every product-related API call so pages don't repeat fetch logic.
export const productsApi = {
  getAll: async (params = {}) => (await api.get("/products", { params })).data.data,
  getById: async (id) => (await api.get(`/products/${id}`)).data.data,
  create: async (productData) => (await api.post("/products", productData)).data.data,
  update: async (id, productData) => (await api.put(`/products/${id}`, productData)).data.data,
  remove: async (id) => (await api.delete(`/products/${id}`)).data.data,
};