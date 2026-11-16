import React, { useState } from "react";
import {
  PlusIcon,
  MessageSquareIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  KeyIcon,
  BotIcon,
} from "./Icons";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isOpen,
  onClose,
  health,
  onOpenSetup,
}) {
  const { isDark, toggleTheme } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id, e) => {
    e?.stopPropagation();
    if (editTitle.trim()) {
      await onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      onDeleteConversation(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-gray-900 text-gray-200 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BotIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Smart AI Assistant</h1>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">
                {health?.active_provider ? `${health.active_provider} LLM` : "Ready to connect"}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-gray-700 hover:border-emerald-500/60 bg-gray-800/80 hover:bg-emerald-600/20 text-white text-xs font-semibold shadow-sm transition-all duration-150 group"
          >
            <PlusIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-1.5 select-none">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-500">
              No previous chats yet. Start a new conversation!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === currentConversationId;
              const isEditing = conv.id === editingId;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose?.();
                  }}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white shadow-sm border-l-2 border-emerald-500"
                      : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                  }`}
                >
                  <MessageSquareIcon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-400"
                    }`}
                  />

                  {/* Title / Rename input */}
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(conv.id, e);
                          if (e.key === "Escape") handleCancelRename(e);
                        }}
                        autoFocus
                        className="w-full bg-gray-950 px-2 py-1 text-xs rounded border border-emerald-500/70 text-white outline-none"
                      />
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 hover:text-emerald-400 text-gray-300"
                        title="Save"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 hover:text-red-400 text-gray-400"
                        title="Cancel"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{conv.title}</span>

                      {/* Action buttons (Rename, Delete) */}
                      <div className="hidden group-hover:flex items-center gap-1 opacity-90">
                        <button
                          onClick={(e) => startEditing(conv, e)}
                          className="p-1 hover:text-emerald-400 text-gray-400 transition-colors"
                          title="Rename chat"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 hover:text-red-400 text-gray-400 transition-colors"
                          title="Delete chat"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions (Theme toggle, API Key Setup) */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          {/* API Key Status Pill */}
          <button
            onClick={onOpenSetup}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-emerald-400" />
              <span>API Key Settings</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "ready" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
              }`}
              title={health?.status === "ready" ? "LLM Ready" : "Setup Required"}
            />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full p-2.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <>
                  <SunIcon className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-mono">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
