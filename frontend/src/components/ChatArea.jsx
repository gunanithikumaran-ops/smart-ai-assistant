import React, { useState, useEffect, useRef } from "react";
import {
  MenuIcon,
  TrashIcon,
  SparklesIcon,
  ArrowDownIcon,
  KeyIcon,
  XIcon,
} from "./Icons";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import WelcomeScreen from "./WelcomeScreen";
import ChatInput from "./ChatInput";
import { useChat } from "../context/ChatContext";

export default function ChatArea({ onToggleSidebar }) {
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    error,
    health,
    sendMessage,
    regenerateLastMessage,
    clearCurrentConversation,
    dismissError,
    setIsSetupOpen,
  } = useChat();

  const [input, setInput] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Find active conversation title
  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const conversationTitle = currentConversation?.title || "New Chat";

  // Auto-scroll to bottom on new messages or typing state change
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleSelectPrompt = (promptText) => {
    sendMessage(promptText);
  };

  const handleClear = () => {
    if (messages.length > 0 && window.confirm("Clear all messages in this conversation?")) {
      clearCurrentConversation();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger menu */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            title="Open sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">
              {conversationTitle}
            </span>

            {/* Model provider badge */}
            <span
              onClick={() => setIsSetupOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors"
              title="Click to check or configure API keys"
            >
              <SparklesIcon className="w-3 h-3" />
              <span>{health?.active_provider ? `${health.active_provider}` : "Configure Key"}</span>
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Clear messages in this chat"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Error / API Key Missing Notification Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 px-4 py-2.5 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold flex-shrink-0">Notice:</span>
            <span className="truncate">{error}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="px-2.5 py-1 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <KeyIcon className="w-3.5 h-3.5" />
              <span>Setup API Key</span>
            </button>
            <button
              onClick={dismissError}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-2 relative"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={handleSelectPrompt} />
        ) : (
          messages.map((msg, index) => {
            const isLast = index === messages.length - 1;
            const isLastAssistant = isLast && msg.role === "assistant";

            return (
              <MessageBubble
                key={msg.id || index}
                message={msg}
                isLastAssistantMessage={isLastAssistant}
                onRegenerate={regenerateLastMessage}
                isLoading={isLoading}
              />
            );
          })
        )}

        {/* Typing indicator while AI is generating */}
        {isLoading && <TypingIndicator />}

        {/* Anchor element for auto-scrolling */}
        <div ref={messagesEndRef} />

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="fixed bottom-24 right-6 p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all z-20"
            title="Scroll to bottom"
          >
            <ArrowDownIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Fixed Chat Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
