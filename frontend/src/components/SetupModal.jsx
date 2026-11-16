import React, { useState } from "react";
import { KeyIcon, XIcon, CheckIcon, CopyIcon, SparklesIcon } from "./Icons";

export default function SetupModal({ isOpen, onClose, onRefreshStatus, health }) {
  const [copiedKey, setCopiedKey] = useState("");

  if (!isOpen) return null;

  const handleCopySnippet = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl p-6 text-gray-900 dark:text-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <KeyIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Configure AI API Key</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set up your free API key in the backend environment to enable full AI responses.
            </p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="p-3 mb-4 rounded-xl text-xs flex items-center justify-between border bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health?.status === "ready" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="font-medium">
              {health?.status === "ready"
                ? `Connected to: ${health?.active_provider}`
                : "No API Key Configured"}
            </span>
          </div>
          <button
            onClick={onRefreshStatus}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Refresh Status
          </button>
        </div>

        <div className="space-y-4 text-xs md:text-sm">
          {/* Option 1: Gemini */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-emerald-500" />
                Option 1: Google Gemini API (Free & Recommended)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Get Free Key ↗
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
              1. Open Google AI Studio and generate a free API key.
              <br />
              2. Open file <code className="px-1 py-0.5 bg-gray-200 dark:bg-slate-800 rounded font-mono">backend/.env</code> and paste:
            </p>
            <div className="flex items-center justify-between p-2 rounded bg-gray-900 text-emerald-400 font-mono text-xs">
              <span>GEMINI_API_KEY=AIzaSy...</span>
              <button
                onClick={() => handleCopySnippet("GEMINI_API_KEY=your_key_here", "gemini")}
                className="text-gray-300 hover:text-white flex items-center gap-1"
              >
                {copiedKey === "gemini" ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copiedKey === "gemini" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Option 2: OpenAI */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between font-semibold text-gray-800 dark:text-gray-200 mb-1">
              <span>Option 2: OpenAI / Groq / OpenRouter API</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                Get OpenAI Key ↗
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
              Alternatively, provide an OpenAI API key in <code className="px-1 py-0.5 bg-gray-200 dark:bg-slate-800 rounded font-mono">backend/.env</code>:
            </p>
            <div className="flex items-center justify-between p-2 rounded bg-gray-900 text-blue-400 font-mono text-xs">
              <span>OPENAI_API_KEY=sk-...</span>
              <button
                onClick={() => handleCopySnippet("OPENAI_API_KEY=your_key_here", "openai")}
                className="text-gray-300 hover:text-white flex items-center gap-1"
              >
                {copiedKey === "openai" ? <CheckIcon className="w-3.5 h-3.5 text-blue-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copiedKey === "openai" ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onRefreshStatus();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
          >
            I've Set the Key
          </button>
        </div>
      </div>
    </div>
  );
}
