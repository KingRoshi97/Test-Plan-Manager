import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  Loader2,
  ChevronLeft,
  CheckCircle,
  Circle,
  FileCode,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface FeatureDetail {
  feature_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  dependencies: string[];
  src_modules: string[];
  gates: string[];
  specs: Record<string, string>;
  reverse_dependencies: string[];
}

const TABS = [
  { key: "contract", label: "Contract" },
  { key: "errors", label: "Errors" },
  { key: "security", label: "Security" },
  { key: "gates_and_proofs", label: "Gates & Proofs" },
  { key: "tests", label: "Tests" },
  { key: "observability", label: "Observability" },
  { key: "docs", label: "Docs" },
  { key: "api", label: "API" },
] as const;

const categoryColors: Record<string, string> = {
  infrastructure: "bg-purple-900/30 text-purple-300",
  interface: "bg-blue-900/30 text-blue-300",
  "core-logic": "bg-amber-900/30 text-amber-300",
  security: "bg-red-900/30 text-red-300",
};

function MarkdownBlock({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
        No content available
      </p>
    );
  }

  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="rounded-md p-4 text-sm overflow-x-auto my-3 font-mono"
          style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="text-xl font-bold mt-6 mb-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-lg font-semibold mt-5 mb-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-base font-semibold mt-4 mb-1.5"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li
          key={`li-${elements.length}`}
          className="text-sm ml-4 list-disc"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.startsWith("| ")) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      const isHeader = lines[lines.indexOf(line) + 1]?.match(/^\|[\s-|]+$/);
      const isSeparator = line.match(/^\|[\s-|]+$/);
      if (isSeparator) continue;
      elements.push(
        <div
          key={`tr-${elements.length}`}
          className={`grid gap-2 text-sm px-2 py-1.5 border-b border-[hsl(var(--border))] ${isHeader ? "font-semibold" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
            color: "hsl(var(--foreground))",
          }}
        >
          {cells.map((cell, i) => (
            <span key={i} className="truncate">
              {renderInline(cell)}
            </span>
          ))}
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={`br-${elements.length}`} className="h-2" />);
    } else {
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-sm leading-relaxed"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {renderInline(line)}
        </p>
      );
    }
  }

  if (inCodeBlock) flushCode();

  return <div>{elements}</div>;
}

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <code
          key={`code-${i++}`}
          className="text-xs px-1 py-0.5 rounded font-mono"
          style={{
            background: "hsl(var(--muted))",
            color: "hsl(var(--foreground))",
          }}
        >
          {match[1]}
        </code>
      );
    } else if (match[2]) {
      parts.push(
        <strong key={`b-${i++}`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={`i-${i++}`} className="italic">
          {match[3]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export default function FeatureDetailPage() {
  const [, params] = useRoute("/features/:id");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("contract");

  const featureId = params?.id || "";

  const { data: feature, isLoading, isError } = useQuery<FeatureDetail>({
    queryKey: ["/api/features", featureId],
    queryFn: () => apiRequest(`/api/features/${featureId}`),
    enabled: !!featureId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (isError || !feature) {
    return (
      <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
        Feature not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        onClick={() => setLocation("/features")}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Features
      </button>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {feature.status === "active" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
                {feature.feature_id}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  feature.status === "active"
                    ? "bg-green-900/30 text-green-300"
                    : "bg-yellow-900/30 text-yellow-300"
                }`}
              >
                {feature.status}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  categoryColors[feature.category] || "bg-gray-800 text-gray-300"
                }`}
              >
                {feature.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {feature.title}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {feature.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Source Modules ({feature.src_modules?.length ?? 0})
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {(feature.src_modules || []).map((mod) => (
                <div
                  key={mod}
                  className="flex items-center gap-1.5 text-xs font-mono text-[hsl(var(--muted-foreground))]"
                >
                  <FileCode className="w-3 h-3 shrink-0" />
                  <span className="truncate">{mod}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Depends On ({feature.dependencies?.length ?? 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(feature.dependencies || []).length === 0 ? (
                <span className="text-xs text-[hsl(var(--muted-foreground))] italic">
                  No dependencies
                </span>
              ) : (
                (feature.dependencies || []).map((dep) => (
                  <button
                    key={dep}
                    onClick={() => setLocation(`/features/${dep}`)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md font-mono hover:bg-[hsl(var(--accent))] transition-colors"
                    style={{
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    {dep}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Depended On By ({feature.reverse_dependencies?.length ?? 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(feature.reverse_dependencies || []).length === 0 ? (
                <span className="text-xs text-[hsl(var(--muted-foreground))] italic">
                  No reverse dependencies
                </span>
              ) : (
                (feature.reverse_dependencies || []).map((dep) => (
                  <button
                    key={dep}
                    onClick={() => setLocation(`/features/${dep}`)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md font-mono hover:bg-[hsl(var(--accent))] transition-colors"
                    style={{
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {dep}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {feature.gates && feature.gates.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Gates
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {feature.gates.map((gate) => (
                <span
                  key={gate}
                  className="text-xs px-2 py-1 rounded-md font-mono"
                  style={{
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {gate}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex border-b border-[hsl(var(--border))] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-t-0 rounded-t-none border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <MarkdownBlock content={feature.specs?.[activeTab] || ""} />
        </div>
      </div>
    </div>
  );
}
