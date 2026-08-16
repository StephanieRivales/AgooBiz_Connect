import api from "./api";

// Centralizes every message-related API call so pages don't repeat fetch logic.
export const messagesApi = {
  getInbox: async () => {
    const res = await api.get("/messages/inbox");
    return res.data;
  },

  getConversation: async (userId) => {
    const res = await api.get(`/messages/conversation/${userId}`);
    return res.data;
  },

  send: async (receiverId, content) => {
    const res = await api.post("/messages", { receiverId, content });
    return res.data;
  },
};