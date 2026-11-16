import React from "react";
import CodeBlock from "./CodeBlock";

export default function FormattedMessage({ content = "" }) {
  if (!content) return null;

  // Split content by code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+#]*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    // The code block itself
    parts.push({
      type: "code",
      language: match[1] || "plaintext",
      code: match[2].trimEnd(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  // Helper to parse inline markdown (bold, italic, inline code)
  const renderInline = (text, keyPrefix = "") => {
    // Regex for inline code `code`, bold **text**, italic *text*
    const tokens = [];
    const inlineRegex = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let i = 0;
    let m;

    while ((m = inlineRegex.exec(text)) !== null) {
      if (m.index > i) {
        tokens.push(text.substring(i, m.index));
      }

      if (m[2] !== undefined) {
        // Inline code
        tokens.push(
          <code
            key={`${keyPrefix}-code-${m.index}`}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-200 dark:bg-gray-800 text-pink-600 dark:text-emerald-400 font-mono text-xs font-medium"
          >
            {m[2]}
          </code>
        );
      } else if (m[3] !== undefined) {
        // Bold
        tokens.push(
          <strong key={`${keyPrefix}-b-${m.index}`} className="font-semibold text-gray-900 dark:text-white">
            {m[3]}
          </strong>
        );
      } else if (m[4] !== undefined) {
        // Italic
        tokens.push(
          <em key={`${keyPrefix}-em-${m.index}`} className="italic">
            {m[4]}
          </em>
        );
      }

      i = m.index + m[0].length;
    }

    if (i < text.length) {
      tokens.push(text.substring(i));
    }

    return tokens;
  };

  // Helper to render text paragraphs, lists, headers, quotes
  const renderTextSegment = (text, segIndex) => {
    const lines = text.split("\n");
    const elements = [];
    let currentList = [];
    let isNumberedList = false;

    const flushList = () => {
      if (currentList.length > 0) {
        if (isNumberedList) {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal pl-6 my-2 space-y-1">
              {currentList.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInline(item, `ol-${elements.length}-${idx}`)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
              {currentList.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInline(item, `ul-${elements.length}-${idx}`)}
                </li>
              ))}
            </ul>
          );
        }
        currentList = [];
        isNumberedList = false;
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Empty line -> flush list and add spacer
      if (!trimmed) {
        flushList();
        return;
      }

      // Headers
      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h4 key={`h3-${lineIdx}`} className="text-base font-bold mt-4 mb-1 text-gray-900 dark:text-gray-100">
            {renderInline(trimmed.substring(4), `h3-${lineIdx}`)}
          </h4>
        );
      } else if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h3 key={`h2-${lineIdx}`} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            {renderInline(trimmed.substring(3), `h2-${lineIdx}`)}
          </h3>
        );
      } else if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(
          <h2 key={`h1-${lineIdx}`} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
            {renderInline(trimmed.substring(2), `h1-${lineIdx}`)}
          </h2>
        );
      }
      // Blockquote
      else if (trimmed.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={`bq-${lineIdx}`}
            className="border-l-4 border-emerald-500 pl-4 py-1 my-2 italic text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/40 rounded-r"
          >
            {renderInline(trimmed.substring(2), `bq-${lineIdx}`)}
          </blockquote>
        );
      }
      // Bullet list items (- or * )
      else if (/^[-*]\s+/.test(trimmed)) {
        if (isNumberedList) flushList();
        isNumberedList = false;
        currentList.push(trimmed.replace(/^[-*]\s+/, ""));
      }
      // Numbered list items (1. , 2. )
      else if (/^\d+\.\s+/.test(trimmed)) {
        if (!isNumberedList && currentList.length > 0) flushList();
        isNumberedList = true;
        currentList.push(trimmed.replace(/^\d+\.\s+/, ""));
      }
      // Regular paragraph line
      else {
        flushList();
        elements.push(
          <p key={`p-${lineIdx}`} className="my-1.5 leading-relaxed break-words">
            {renderInline(trimmed, `p-${lineIdx}`)}
          </p>
        );
      }
    });

    flushList();
    return <div key={`seg-${segIndex}`}>{elements}</div>;
  };

  return (
    <div className="space-y-1 text-sm md:text-base leading-relaxed">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return <CodeBlock key={`code-${index}`} language={part.language} code={part.code} />;
        }
        return renderTextSegment(part.content, index);
      })}
    </div>
  );
}
