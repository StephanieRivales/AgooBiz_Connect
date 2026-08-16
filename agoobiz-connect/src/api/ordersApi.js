import api from "./api";

// Centralizes every order-related API call so pages don't repeat fetch logic.
export const ordersApi = {
  getAll: async () => {
    const res = await api.get("/orders");
    return res.data;
  },

  create: async (orderData) => {
    const res = await api.post("/orders", orderData);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },
};