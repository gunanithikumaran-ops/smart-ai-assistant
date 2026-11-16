import React, { useState } from "react";
import { UserIcon, BotIcon, CopyIcon, CheckIcon, RefreshIcon } from "./Icons";
import FormattedMessage from "./FormattedMessage";

export default function MessageBubble({
  message,
  isLastAssistantMessage = false,
  onRegenerate,
  isLoading = false,
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 p-3 md:px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-emerald-600 text-white shadow-sm text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-gray-400 mt-1 select-none px-1">
              {formattedTime}
            </span>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 flex items-center justify-center mt-1 shadow-sm">
          <UserIcon className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start gap-3 md:gap-4 p-4 md:px-6 max-w-4xl mx-auto w-full animate-fade-in group hover:bg-gray-100/40 dark:hover:bg-slate-900/30 rounded-2xl transition-colors">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mt-1 shadow-sm">
        <BotIcon className="w-4 h-4" />
      </div>

      {/* Message Content & Actions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 select-none">
          <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
            Smart AI Assistant
          </span>
          {formattedTime && (
            <span className="text-[10px] text-gray-400">
              {formattedTime}
            </span>
          )}
        </div>

        {/* Formatted body */}
        <div className="text-gray-800 dark:text-gray-200">
          <FormattedMessage content={message.content} />
        </div>

        {/* Action bar (Copy, Regenerate) */}
        <div className="flex items-center gap-2 mt-3 pt-2 text-xs text-gray-500 dark:text-gray-400">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Copy response"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {isLastAssistantMessage && onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
              title="Regenerate response"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
