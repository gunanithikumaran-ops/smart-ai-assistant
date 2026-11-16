import React, { useRef, useEffect } from "react";
import { SendIcon } from "./Icons";

export default function ChatInput({ input, setInput, onSend, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 180);
    textarea.style.height = `${nextHeight}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend();
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent pt-4 pb-4 px-4 md:px-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative flex flex-col bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-3xl shadow-lg transition-shadow focus-within:border-emerald-500/60 dark:focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20"
      >
        <div className="flex items-end px-4 py-3 gap-2">
          {/* Text input area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything in English or Tamil... (Shift + Enter for new line)"
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base outline-none max-h-44 leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 shadow-md shadow-emerald-600/30"
            title="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendIcon className="w-4 h-4 translate-x-0.5" />
            )}
          </button>
        </div>
      </form>

      {/* Footer disclaimer */}
      <div className="text-center mt-2 select-none">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Smart AI Assistant • Context-aware ChatGPT-inspired AI • English & தமிழ் Support
        </span>
      </div>
    </div>
  );
}
