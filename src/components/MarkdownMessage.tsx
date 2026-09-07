import React from "react";

interface MarkdownMessageProps {
  content: string;
}

// Parses inline markdown: bold (**text**), italic (*text*), code (`code`), strikethrough (~~text~~)
function renderInline(text: string): React.ReactNode[] {
  // Regex to split by markdown tokens: **bold**, *italic*, `code`, ~~strike~~
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-blue-300 dark:text-blue-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="bg-[#181B24] text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#2B3040]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={index} className="line-through text-slate-400">
          {part.slice(2, -2)}
        </del>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${key}`} className="space-y-1.5 my-2 pl-4 list-decimal list-outside text-slate-200">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} className="space-y-1.5 my-2 pr-1 space-y-1 text-slate-200">
            {listItems}
          </ul>
        );
      }
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule: --- or ***
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList(`hr-${index}`);
      elements.push(<hr key={`hr-${index}`} className="my-2.5 border-t border-[#232734]" />);
      return;
    }

    // Heading 1: # Header
    if (trimmed.startsWith("# ")) {
      flushList(`h1-${index}`);
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-[13px] font-bold text-blue-400 mt-2 mb-1.5 pb-1 border-b border-blue-500/20 font-mono flex items-center gap-1.5"
        >
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Heading 2: ## Header
    if (trimmed.startsWith("## ")) {
      flushList(`h2-${index}`);
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-[12px] font-bold text-slate-100 mt-2.5 mb-1 flex items-center gap-1.5 font-sans tracking-wide"
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // Heading 3: ### Header
    if (trimmed.startsWith("### ")) {
      flushList(`h3-${index}`);
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-[11.5px] font-semibold text-blue-300 mt-2 mb-1 flex items-center gap-1.5"
        >
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Bullet List Item: - item, * item, + item
    const bulletMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (bulletMatch) {
      if (isNumberedList && listItems.length > 0) {
        flushList(`switch-num-${index}`);
      }
      isNumberedList = false;
      const indentLevel = Math.floor(bulletMatch[1].length / 2);
      listItems.push(
        <li
          key={`li-${index}`}
          className={`flex items-start space-x-1.5 ${indentLevel > 0 ? "mr-4" : ""} text-[11px] leading-relaxed`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 ml-1.5" />
          <div className="flex-1">{renderInline(bulletMatch[3])}</div>
        </li>
      );
      return;
    }

    // Numbered List Item: 1. item, ۱. item, etc.
    const numMatch = line.match(/^(\s*)([0-9]+|[۰-۹]+)[.)]\s+(.+)$/);
    if (numMatch) {
      if (!isNumberedList && listItems.length > 0) {
        flushList(`switch-bullet-${index}`);
      }
      isNumberedList = true;
      const numLabel = numMatch[2];
      const content = numMatch[3];
      listItems.push(
        <li key={`num-li-${index}`} className="flex items-start space-x-1.5 text-[11px] leading-relaxed">
          <span className="font-mono text-blue-400 font-bold min-w-[16px] text-right shrink-0 ml-1">
            {numLabel}.
          </span>
          <div className="flex-1">{renderInline(content)}</div>
        </li>
      );
      return;
    }

    // Regular paragraph or empty line
    flushList(`flush-${index}`);

    if (trimmed === "") {
      elements.push(<div key={`empty-${index}`} className="h-1.5" />);
    } else {
      elements.push(
        <p key={`p-${index}`} className="my-1 text-[11px] leading-relaxed text-slate-200">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList("final");

  return <div className="space-y-0.5 text-right" dir="auto">{elements}</div>;
};
