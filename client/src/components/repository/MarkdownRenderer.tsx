import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content into blocks: code blocks, tables, lists, and paragraphs
  const renderBlocks = () => {
    if (!content || !content.trim()) {
      return (
        <p className="text-xs text-matte-500 italic font-mono">
          No preview content available.
        </p>
      );
    }

    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];
    let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;
    let blockIndex = 0;

    const flushList = () => {
      if (!listBuffer) return;
      const Tag = listBuffer.type;
      const items = [...listBuffer.items];
      listBuffer = null;
      blocks.push(
        <Tag
          key={`list-${blockIndex++}`}
          className={`space-y-1 my-2.5 text-xs text-matte-200 ${
            Tag === "ul" ? "list-disc pl-5" : "list-decimal pl-5"
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;

      // Code block toggles
      if (line.trim().startsWith("```")) {
        flushList();
        if (inCodeBlock) {
          // Closing code block
          const codeText = codeBuffer.join("\n");
          const curIdx = blockIndex++;
          blocks.push(
            <div
              key={`code-${curIdx}`}
              className="my-3 rounded-lg overflow-hidden border border-matte-800 bg-matte-950 text-xs font-mono"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-matte-900 border-b border-matte-800 text-[11px] text-matte-400">
                <span>{codeLanguage || "code"}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeText, curIdx)}
                  className="flex items-center gap-1 hover:text-matte-200 transition"
                >
                  {copiedIndex === curIdx ? (
                    <Check size={11} className="text-sage-400" />
                  ) : (
                    <Copy size={11} />
                  )}
                  <span>{copiedIndex === curIdx ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-matte-200 leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
          codeLanguage = "";
        } else {
          // Opening code block
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Empty line breaks list
      if (!line.trim()) {
        flushList();
        continue;
      }

      // Headers
      if (line.startsWith("# ")) {
        flushList();
        blocks.push(
          <h1
            key={`h1-${blockIndex++}`}
            className="text-lg font-bold font-mono text-matte-50 border-b border-matte-800 pb-2 mt-4 mb-2"
          >
            {renderInline(line.slice(2))}
          </h1>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        blocks.push(
          <h2
            key={`h2-${blockIndex++}`}
            className="text-base font-bold font-mono text-matte-100 border-b border-matte-800/60 pb-1.5 mt-4 mb-2"
          >
            {renderInline(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith("### ")) {
        flushList();
        blocks.push(
          <h3
            key={`h3-${blockIndex++}`}
            className="text-sm font-semibold font-mono text-matte-150 mt-3 mb-1.5"
          >
            {renderInline(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith("#### ")) {
        flushList();
        blocks.push(
          <h4
            key={`h4-${blockIndex++}`}
            className="text-xs font-semibold font-mono text-matte-200 mt-2 mb-1"
          >
            {renderInline(line.slice(5))}
          </h4>
        );
        continue;
      }

      // Horizontal rule
      if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        blocks.push(<hr key={`hr-${blockIndex++}`} className="border-matte-800 my-4" />);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        blocks.push(
          <blockquote
            key={`quote-${blockIndex++}`}
            className="border-l-2 border-sage-500/70 pl-3 my-2 text-xs text-matte-300 italic bg-matte-900/40 py-1"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Unordered list
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push(line.trim().slice(2));
        continue;
      }

      // Ordered list
      const olMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (olMatch && olMatch[2]) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push(olMatch[2]);
        continue;
      }

      // Regular paragraph
      flushList();
      blocks.push(
        <p key={`p-${blockIndex++}`} className="text-xs text-matte-200 my-1.5 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    return blocks;
  };

  // Helper to parse inline markdown: bold, italic, code, links
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch && codeMatch[1]) {
        parts.push(
          <code
            key={`inline-code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded bg-matte-800 text-sage-300 font-mono text-[11px] border border-matte-700/60"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **bold**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch[1]) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-semibold text-matte-50">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *italic*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch && italicMatch[1]) {
        parts.push(
          <em key={`italic-${keyIdx++}`} className="italic text-matte-300">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Link: [title](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch[1] && linkMatch[2]) {
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-400 hover:underline inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Plain character
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Unmatched special char, output as plain text
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  return <div className="space-y-1 font-sans">{renderBlocks()}</div>;
};
