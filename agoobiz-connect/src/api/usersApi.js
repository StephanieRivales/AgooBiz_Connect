import api from "./api";

// Centralizes every user/account-related API call so pages don't repeat fetch logic.
export const usersApi = {
  getMe: async () => (await api.get("/users/me")).data.data,
  updateMe: async (userData) => (await api.put("/users/me", userData)).data.data,
  getAll: async () => (await api.get("/users")).data.data,
  update: async (id, userData) => (await api.put(`/users/${id}`, userData)).data.data,
  remove: async (id) => (await api.delete(`/users/${id}`)).data.data,
};