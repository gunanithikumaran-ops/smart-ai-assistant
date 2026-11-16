import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Load conversations on mount
  const refreshConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  // Check backend health & AI status
  const refreshHealth = useCallback(async () => {
    try {
      const data = await api.checkHealth();
      setHealth(data);
      return data;
    } catch (err) {
      console.warn("Backend health check failed:", err.message);
      setHealth({
        status: "offline",
        gemini_configured: false,
        openai_configured: false,
        active_provider: null,
        message: "Cannot reach backend server.",
      });
    }
  }, []);

  useEffect(() => {
    refreshConversations();
    refreshHealth();
  }, [refreshConversations, refreshHealth]);

  // Select an existing conversation
  const selectConversation = async (id) => {
    if (!id || id === currentConversationId) return;
    setError(null);
    try {
      const conv = await api.getConversation(id);
      setCurrentConversationId(conv.id);
      setMessages(conv.messages || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Start a fresh chat
  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
  };

  // Send a user message
  const sendMessage = async (promptText) => {
    if (!promptText.trim() || isLoading) return;
    setError(null);

    // Optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: promptText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(promptText, currentConversationId);

      // Replace temp user message with real one from DB, and append assistant reply
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, res.user_message, res.assistant_message];
      });

      // Update current conversation ID if this was a new chat
      if (!currentConversationId) {
        setCurrentConversationId(res.conversation_id);
      }

      // Refresh conversations list to update title and order
      await refreshConversations();
    } catch (err) {
      const errMsg = err.message || "Failed to get AI response.";
      setError(errMsg);

      // If the error mentions missing API key, prompt user with Setup modal!
      if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("not found")) {
        setIsSetupOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate last AI response
  const regenerateLastMessage = async () => {
    if (!currentConversationId || isLoading) return;
    setError(null);
    setIsLoading(true);

    // Temporarily remove last assistant message from UI while generating
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    try {
      const res = await api.regenerateMessage(currentConversationId);
      setMessages((prev) => [...prev, res.assistant_message]);
      await refreshConversations();
    } catch (err) {
      const errMsg = err.message || "Failed to regenerate AI response.";
      setError(errMsg);
      if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("not found")) {
        setIsSetupOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Rename a conversation
  const renameConversation = async (id, newTitle) => {
    try {
      await api.updateConversation(id, newTitle);
      await refreshConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a conversation
  const deleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      if (currentConversationId === id) {
        startNewChat();
      }
      await refreshConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Clear messages in current conversation
  const clearCurrentConversation = async () => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }
    try {
      await api.clearConversation(currentConversationId);
      setMessages([]);
      await refreshConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        isLoading,
        error,
        health,
        isSetupOpen,
        setIsSetupOpen,
        selectConversation,
        startNewChat,
        sendMessage,
        regenerateLastMessage,
        renameConversation,
        deleteConversation,
        clearCurrentConversation,
        dismissError: () => setError(null),
        refreshHealth,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
