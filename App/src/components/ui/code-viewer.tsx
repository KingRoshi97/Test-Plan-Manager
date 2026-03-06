import { useState, useMemo, useCallback } from "react";

interface CodeViewerProps {
  content: string;
  language?: "json" | "markdown" | "text";
  showLineNumbers?: boolean;
  maxHeight?: string;
  title?: string;
  className?: string;
}

function highlightJson(raw: string): string {
  try {
    const formatted = JSON.stringify(JSON.parse(raw), null, 2);
    return formatted.replace(
      /("(?:\\.|[^"\\])*")\s*:/g,
      '<span class="json-key">$1</span>:'
    ).replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span class="json-string">$1</span>'
    ).replace(
      /:\s*(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      ': <span class="json-number">$1</span>'
    ).replace(
      /:\s*(true|false)/g,
      ': <span class="json-boolean">$1</span>'
    ).replace(
      /:\s*(null)/g,
      ': <span class="json-null">$1</span>'
    ).replace(
      /(?<=\[|,\s*)\s*("(?:\\.|[^"\\])*")(?=\s*[,\]])/g,
      '<span class="json-string">$1</span>'
    ).replace(
      /(?<=\[|,\s*)\s*(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s*[,\]])/g,
      '<span class="json-number">$1</span>'
    ).replace(
      /(?<=\[|,\s*)\s*(true|false)(?=\s*[,\]])/g,
      '<span class="json-boolean">$1</span>'
    ).replace(
      /(?<=\[|,\s*)\s*(null)(?=\s*[,\]])/g,
      '<span class="json-null">$1</span>'
    );
  } catch {
    return escapeHtml(raw);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(raw: string): string {
  const lines = raw.split("\n");
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  const output: string[] = [];

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      if (inCodeBlock) {
        output.push(
          `<pre class="cv-code-block"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    let processed = escapeHtml(line);

    const headingMatch = processed.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes: Record<number, string> = {
        1: "text-xl font-bold",
        2: "text-lg font-semibold",
        3: "text-base font-semibold",
        4: "text-sm font-semibold",
        5: "text-sm font-medium",
        6: "text-xs font-medium",
      };
      output.push(
        `<div class="${sizes[level]} cv-heading" style="margin: 0.75em 0 0.35em;">${headingMatch[2]}</div>`
      );
      continue;
    }

    processed = processed.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="cv-bold">$1</strong>'
    );
    processed = processed.replace(
      /`([^`]+)`/g,
      '<code class="cv-inline-code">$1</code>'
    );

    const listMatch = processed.match(/^(\s*)[-*]\s+(.*)/);
    if (listMatch) {
      const indent = Math.floor(listMatch[1].length / 2);
      output.push(
        `<div class="cv-list-item" style="padding-left: ${indent * 1.25 + 1}em;">• ${listMatch[2]}</div>`
      );
      continue;
    }

    const orderedMatch = processed.match(/^(\s*)(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      const indent = Math.floor(orderedMatch[1].length / 2);
      output.push(
        `<div class="cv-list-item" style="padding-left: ${indent * 1.25 + 1}em;">${orderedMatch[2]}. ${orderedMatch[3]}</div>`
      );
      continue;
    }

    if (processed.trim() === "") {
      output.push('<div class="cv-spacer" style="height: 0.5em;"></div>');
    } else {
      output.push(`<div class="cv-paragraph">${processed}</div>`);
    }
  }

  if (inCodeBlock && codeBlockContent.length > 0) {
    output.push(
      `<pre class="cv-code-block"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`
    );
  }

  return output.join("\n");
}

function detectLanguage(content: string, lang?: "json" | "markdown" | "text"): "json" | "markdown" | "text" {
  if (lang) return lang;
  const trimmed = content.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(content);
      return "json";
    } catch {
      return "text";
    }
  }
  if (/^#{1,6}\s/m.test(content) || /\*\*.+\*\*/m.test(content)) {
    return "markdown";
  }
  return "text";
}

export function CodeViewer({
  content,
  language,
  showLineNumbers = false,
  maxHeight = "600px",
  title,
  className = "",
}: CodeViewerProps) {
  const [lineNumbers, setLineNumbers] = useState(showLineNumbers);
  const [copied, setCopied] = useState(false);

  const detectedLang = useMemo<"json" | "markdown" | "text">(() => detectLanguage(content, language), [content, language]);

  const rendered = useMemo(() => {
    if (detectedLang === "json") return highlightJson(content);
    if (detectedLang === "markdown") return renderMarkdown(content);
    return escapeHtml(content);
  }, [content, detectedLang]);

  const lines = useMemo(() => {
    if (detectedLang === "markdown") return [];
    return rendered.split("\n");
  }, [rendered, detectedLang]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  const langLabel = detectedLang === "json" ? "JSON" : detectedLang === "markdown" ? "MD" : "TEXT";

  return (
    <div className={`glass-panel-solid animate-fade-in ${className}`}>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid hsl(var(--glass-border))" }}
      >
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
              {title}
            </span>
          )}
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background: "hsl(var(--primary) / 0.12)",
              color: "hsl(var(--primary))",
            }}
          >
            {langLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {detectedLang !== "markdown" && (
            <button
              onClick={() => setLineNumbers(!lineNumbers)}
              className="px-2 py-1 rounded text-[11px] transition-colors"
              style={{
                color: lineNumbers ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                background: lineNumbers ? "hsl(var(--primary) / 0.1)" : "transparent",
              }}
              title="Toggle line numbers"
            >
              #
            </button>
          )}
          <button
            onClick={handleCopy}
            className="px-2 py-1 rounded text-[11px] transition-colors"
            style={{
              color: copied ? "hsl(var(--status-success))" : "hsl(var(--muted-foreground))",
              background: copied ? "hsl(var(--status-success) / 0.1)" : "transparent",
            }}
            title="Copy to clipboard"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div
        className="scrollbar-thin"
        style={{ maxHeight, overflow: "auto" }}
      >
        {detectedLang === "markdown" ? (
          <div
            className="cv-markdown p-4 text-sm"
            style={{ color: "hsl(var(--foreground))", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        ) : (
          <pre
            className="font-mono-tech text-[13px] p-4"
            style={{
              margin: 0,
              background: "transparent",
              color: "hsl(var(--foreground))",
              lineHeight: 1.6,
            }}
          >
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {lineNumbers && (
                  <span
                    className="select-none text-right shrink-0"
                    style={{
                      width: `${String(lines.length).length * 0.7 + 1}em`,
                      marginRight: "1em",
                      color: "hsl(var(--muted-foreground) / 0.4)",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: line || " " }}
                />
              </div>
            ))}
          </pre>
        )}
      </div>

      <style>{`
        .json-key { color: hsl(var(--primary)); }
        .json-string { color: hsl(145, 65%, 48%); }
        .json-number { color: hsl(190, 90%, 60%); }
        .json-boolean { color: hsl(38, 95%, 55%); }
        .json-null { color: hsl(var(--muted-foreground)); font-style: italic; }
        .cv-heading { color: hsl(var(--foreground)); }
        .cv-bold { color: hsl(var(--foreground)); font-weight: 600; }
        .cv-inline-code {
          font-family: "JetBrains Mono", "Fira Code", "SF Mono", ui-monospace, monospace;
          font-size: 0.85em;
          background: hsl(var(--secondary));
          padding: 0.15em 0.4em;
          border-radius: 3px;
          color: hsl(var(--primary));
        }
        .cv-code-block {
          font-family: "JetBrains Mono", "Fira Code", "SF Mono", ui-monospace, monospace;
          font-size: 0.85em;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--glass-border));
          border-radius: var(--radius);
          padding: 0.75em 1em;
          margin: 0.5em 0;
          overflow-x: auto;
          color: hsl(var(--foreground));
        }
        .cv-list-item {
          color: hsl(var(--foreground));
          line-height: 1.6;
        }
        .cv-paragraph {
          color: hsl(var(--foreground));
        }
        .cv-markdown a { color: hsl(var(--primary)); text-decoration: underline; }
      `}</style>
    </div>
  );
}
