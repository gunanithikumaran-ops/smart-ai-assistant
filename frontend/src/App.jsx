import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider, useChat } from "./context/ChatContext";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import SetupModal from "./components/SetupModal";

function ChatApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    conversations,
    currentConversationId,
    selectConversation,
    startNewChat,
    renameConversation,
    deleteConversation,
    health,
    isSetupOpen,
    setIsSetupOpen,
    refreshHealth,
  } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 font-sans">
      {/* ChatGPT-style Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewChat={startNewChat}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        health={health}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main Chat Conversation View */}
      <ChatArea onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Interactive API Key Setup Guidance Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onRefreshStatus={refreshHealth}
        health={health}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </ThemeProvider>
  );
}
