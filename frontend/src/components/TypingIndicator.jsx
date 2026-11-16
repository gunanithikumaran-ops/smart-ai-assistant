import React from "react";
import { BotIcon } from "./Icons";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 p-4 md:px-6 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
        <BotIcon className="w-4 h-4" />
      </div>

      {/* Typing Bubble */}
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 dot-1"></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 dot-2"></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 dot-3"></span>
        <span className="text-xs text-gray-400 font-medium ml-2">Smart AI is thinking...</span>
      </div>
    </div>
  );
}
