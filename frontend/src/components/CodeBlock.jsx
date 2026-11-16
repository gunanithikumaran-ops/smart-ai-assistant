import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

export default function CodeBlock({ language = "text", code = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Clean language tag
  const displayLang = (language || "code").toLowerCase();

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-gray-700/60 bg-gray-950 text-gray-100 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800 text-xs text-gray-400 font-mono select-none">
        <span className="font-semibold uppercase tracking-wider text-emerald-400">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-200 selection:bg-emerald-800/60 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}
