import api from "./api";

// Centralizes every message-related API call so pages don't repeat fetch logic.
export const messagesApi = {
  getInbox: async () => (await api.get("/messages/inbox")).data.data,
  getConversation: async (userId) => (await api.get(`/messages/conversation/${userId}`)).data.data,
  send: async (receiverId, content) => (await api.post("/messages", { receiverId, content })).data.data,
};