import api from "./api";

// Centralizes every order-related API call so pages don't repeat fetch logic.
export const ordersApi = {
  getAll: async () => (await api.get("/orders")).data.data,
  create: async (orderData) => (await api.post("/orders", orderData)).data.data,
  updateStatus: async (id, status) => (await api.put(`/orders/${id}/status`, { status })).data.data,
};