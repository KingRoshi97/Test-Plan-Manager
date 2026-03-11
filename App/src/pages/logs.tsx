import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  ScrollText,
  Activity,
  Clock,
  Loader2,
  Lock,
  Play,
  CheckCircle2,
  XCircle,
  Radio,
  CircleDot,
  Shield,
  ChevronRight,
  Filter,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import type { Assembly } from "../../../shared/schema";

interface AuditEntry {
  timestamp: string;
  action: string;
  run_id: string;
  details?: Record<string, any>;
  hash?: string;
  prev_hash?: string;
}

const statusFilters = ["all", "running", "completed", "failed", "queued"] as const;
const auditActionFilters = ["all", "run.created", "stage.started", "stage.completed", "gate.evaluated"] as const;

function actionToVariant(action: string): "processing" | "success" | "warning" | "failure" | "intelligence" | "neutral" {
  if (action === "run.created") return "processing";
  if (action === "stage.started") return "warning";
  if (action === "stage.completed") return "success";
  if (action.includes("gate")) return "intelligence";
  if (action.includes("fail") || action.includes("error")) return "failure";
  return "neutral";
}

function actionLabel(action: string): string {
  return action.split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(ts: string): string {
  const now = Date.now();
  const diff = now - new Date(ts).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function RunLogTab() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>("all");

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
  });

  const filtered = filter === "all" ? assemblies : assemblies.filter((a) => a.status === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-xs rounded-full capitalize transition-all ${
                filter === s
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium"
                  : "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{sorted.length} entries</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : sorted.length === 0 ? (
        <GlassPanel solid className="flex flex-col items-center justify-center py-16">
          <ScrollText className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No entries found</p>
        </GlassPanel>
      ) : (
        <GlassPanel solid className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">PROJECT</th>
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">RUN ID</th>
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">STATUS</th>
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">STEP</th>
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">CREATED</th>
                <th className="text-left px-4 py-3 text-system-label text-[10px] font-semibold tracking-wider">UPDATED</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((assembly) => (
                <tr
                  key={assembly.id}
                  onClick={() => setLocation(`/assembly/${assembly.id}`)}
                  className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.3)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                    {assembly.projectName}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono-tech px-1.5 py-0.5 rounded bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground))]">
                      {assembly.runId || "—"}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip
                      variant={getStatusVariant(assembly.status)}
                      label={assembly.status}
                      pulse={assembly.status === "running"}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {assembly.currentStep || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatRelativeTime(assembly.createdAt as unknown as string)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatRelativeTime(assembly.updatedAt as unknown as string)}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      )}
    </div>
  );
}

function AuditTrailTab() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (actionFilter !== "all") params.set("action", actionFilter);

  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["/api/audit-log", actionFilter, limit],
    queryFn: () => apiRequest(`/api/audit-log?${params.toString()}`),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        <div className="flex gap-1 flex-wrap">
          {auditActionFilters.map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                actionFilter === a
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium"
                  : "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              }`}
            >
              {a === "all" ? "All" : actionLabel(a)}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{entries.length} entries</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : entries.length === 0 ? (
        <GlassPanel solid className="flex flex-col items-center justify-center py-16">
          <ScrollText className="w-10 h-10 text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No audit entries found</p>
        </GlassPanel>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <GlassPanel
              key={`${entry.timestamp}-${i}`}
              solid
              className="px-4 py-2.5 flex items-center gap-3 transition-all hover:border-[hsl(var(--primary)/0.2)]"
            >
              <div className="shrink-0 w-[130px]">
                <span className="text-[11px] font-mono-tech text-[hsl(var(--muted-foreground))]">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>

              <div className="shrink-0">
                <StatusChip
                  variant={actionToVariant(entry.action)}
                  label={actionLabel(entry.action)}
                />
              </div>

              <code className="shrink-0 text-[11px] font-mono-tech px-1.5 py-0.5 rounded bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--status-processing))]">
                {entry.run_id}
              </code>

              <div className="flex-1 min-w-0 text-xs text-[hsl(var(--muted-foreground))] truncate">
                {entry.details?.stage_id && (
                  <span>{entry.details.stage_id}</span>
                )}
                {entry.details?.result && (
                  <span className={`ml-2 font-medium ${
                    entry.details.result === "pass" ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-failure))]"
                  }`}>
                    {entry.details.result}
                  </span>
                )}
                {entry.details?.report_ref && (
                  <span className="ml-2 font-mono-tech opacity-60">{entry.details.report_ref}</span>
                )}
              </div>

              {entry.hash && (
                <div className="shrink-0 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] opacity-50">
                  <Lock className="w-2.5 h-2.5" />
                  <span className="font-mono-tech">{entry.hash.substring(0, 8)}</span>
                </div>
              )}
            </GlassPanel>
          ))}

          {entries.length >= limit && (
            <button
              onClick={() => setLimit((prev) => prev + 50)}
              className="w-full py-2.5 text-xs text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.3)] rounded-md transition-colors font-medium"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogsPage() {
  const [tab, setTab] = useState<"runs" | "audit">("runs");

  const tabs = [
    { id: "runs" as const, label: "Assembly Log", icon: Play },
    { id: "audit" as const, label: "Audit Trail", icon: Lock },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">Operations Log</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Pipeline activity and system audit trail</p>
      </div>

      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "runs" ? <RunLogTab /> : <AuditTrailTab />}
    </div>
  );
}
