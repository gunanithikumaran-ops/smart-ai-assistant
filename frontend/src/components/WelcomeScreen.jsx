import React from "react";
import { SparklesIcon, CodeIcon, BookOpenIcon, LanguagesIcon } from "./Icons";

export default function WelcomeScreen({ onSelectPrompt }) {
  const suggestions = [
    {
      icon: <CodeIcon className="w-5 h-5 text-emerald-500" />,
      title: "Write & Explain Code",
      prompt: "Write a complete Python FastAPI REST API with SQLite database connection and input validation.",
    },
    {
      icon: <BookOpenIcon className="w-5 h-5 text-blue-500" />,
      title: "Explain Concepts",
      prompt: "Explain how React virtual DOM works and why it improves web performance.",
    },
    {
      icon: <LanguagesIcon className="w-5 h-5 text-purple-500" />,
      title: "தமிழ் / Tamil Chat",
      prompt: "வணக்கம்! பைத்தான் (Python) நிரலாக்க மொழியின் சிறப்பம்சங்கள் என்ன? தமிழில் விளக்குங்கள்.",
    },
    {
      icon: <SparklesIcon className="w-5 h-5 text-amber-500" />,
      title: "Summarize & Brainstorm",
      prompt: "Summarize the key differences between SQL and NoSQL databases with pros and cons.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 text-center select-none animate-slide-up">
      {/* Hero Badge */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
        <SparklesIcon className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
        How can I help you today?
      </h1>
      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Ask questions, generate & debug code, translate Tamil & English, or summarize long documents.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-150 group shadow-sm"
          >
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {item.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
