import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smart-ai-assistant-0uht.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s for LLM responses
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected network or server error occurred.";
    if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Check health and LLM API key status
  async checkHealth() {
    const res = await apiClient.get("/api/chat/health");
    return res.data;
  },

  // Conversations
  async getConversations() {
    const res = await apiClient.get("/api/conversations");
    return res.data;
  },

  async getConversation(id) {
    const res = await apiClient.get(`/api/conversations/${id}`);
    return res.data;
  },

  async createConversation(title = "New Chat") {
    const res = await apiClient.post("/api/conversations", { title });
    return res.data;
  },

  async updateConversation(id, title) {
    const res = await apiClient.patch(`/api/conversations/${id}`, { title });
    return res.data;
  },

  async deleteConversation(id) {
    const res = await apiClient.delete(`/api/conversations/${id}`);
    return res.data;
  },

  async clearConversation(id) {
    const res = await apiClient.post(`/api/conversations/${id}/clear`);
    return res.data;
  },

  // AI Chat
  async sendMessage(message, conversationId = null) {
    const res = await apiClient.post("/api/chat", {
      message,
      conversation_id: conversationId,
    });
    return res.data;
  },

  async regenerateMessage(conversationId) {
    const res = await apiClient.post("/api/chat/regenerate", {
      conversation_id: conversationId,
    });
    return res.data;
  },
};

export default apiClient;
