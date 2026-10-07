import api from "./api";

// Centralizes every user/account-related API call so pages don't repeat fetch logic.
export const usersApi = {
  getMe: async () => (await api.get("/users/me")).data.data,
  updateMe: async (userData) => (await api.put("/users/me", userData)).data.data,
  getAll: async () => (await api.get("/users")).data.data,
  discover: async (search = "") => (await api.get("/users/discover", { params: { search } })).data.data,
  getFollowing: async () => (await api.get("/users/following")).data.data,
  follow: async (id) => (await api.post(`/users/${id}/follow`)).data.data,
  unfollow: async (id) => (await api.delete(`/users/${id}/follow`)).data.data,
  update: async (id, userData) => (await api.put(`/users/${id}`, userData)).data.data,
  remove: async (id) => (await api.delete(`/users/${id}`)).data.data,
};