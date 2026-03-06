import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  Plus,
  Loader2,
  Trash2,
  ExternalLink,
  Rocket,
  Activity,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import { usePipelineStatus, getStallLevel, formatStallTime } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";

type FilterStatus = "all" | "running" | "completed" | "failed" | "queued";

const filterChips: { key: FilterStatus; label: string; icon: typeof Activity }[] = [
  { key: "all", label: "All", icon: Activity },
  { key: "running", label: "Active", icon: Radio },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "failed", label: "Failed", icon: XCircle },
  { key: "queued", label: "Queued", icon: Clock },
];

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "\u2014";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "\u2014";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function RunsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 5000,
  });

  const hasActiveRuns = assemblies.some((a) => a.status === "running");
  const { data: pipelineStatus } = usePipelineStatus(hasActiveRuns);

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/assemblies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
  });

  const filtered =
    activeFilter === "all"
      ? assemblies
      : assemblies.filter((a) => a.status === activeFilter);

  const counts: Record<FilterStatus, number> = {
    all: assemblies.length,
    running: assemblies.filter((a) => a.status === "running").length,
    completed: assemblies.filter((a) => a.status === "completed").length,
    failed: assemblies.filter((a) => a.status === "failed").length,
    queued: assemblies.filter((a) => a.status === "queued").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Runs</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Fleet management &mdash; monitor, filter, and manage all pipeline runs
          </p>
        </div>
        <button
          onClick={() => setLocation("/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Run
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <chip.icon className="w-3 h-3" />
              {chip.label}
              <span
                className={`ml-0.5 tabular-nums ${
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground)/0.7)]"
                }`}
              >
                {counts[chip.key]}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassPanel solid className="p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-1">
            {activeFilter === "all"
              ? "No runs yet"
              : `No ${activeFilter} runs`}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            {activeFilter === "all"
              ? "Launch your first run to get started."
              : "Try changing the filter or start a new run."}
          </p>
          {activeFilter === "all" && (
            <button
              onClick={() => setLocation("/new")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Run
            </button>
          )}
        </GlassPanel>
      ) : (
        <div className="glass-panel-solid overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-2.5 text-system-label">Project</th>
                <th className="text-left px-4 py-2.5 text-system-label">Status</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Pipeline</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Preset</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Elapsed</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Duration</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Updated</th>
                <th className="text-right px-4 py-2.5 text-system-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const statusEntry = a.status === "running"
                  ? pipelineStatus?.activeRuns?.find((s) => s.assemblyId === a.id)
                  : undefined;
                const stallLevel = statusEntry ? getStallLevel(statusEntry.stalledMs) : "none";

                return (
                  <tr
                    key={a.id}
                    className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.5)] cursor-pointer transition-colors"
                    onClick={() => setLocation(`/assembly/${a.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[hsl(var(--foreground))] text-[13px]">
                        {a.projectName}
                      </div>
                      {a.idea && (
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate max-w-[200px] mt-0.5">
                          {a.idea}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusChip
                          variant={stallLevel === "critical" ? "failure" : stallLevel === "warning" ? "warning" : getStatusVariant(a.status)}
                          label={stallLevel === "critical" ? "Stalled" : stallLevel === "warning" ? "Slow" : a.status}
                          pulse={a.status === "running"}
                        />
                        {stallLevel !== "none" && statusEntry && (
                          <span className={`text-[10px] flex items-center gap-1 ${
                            stallLevel === "critical" ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--status-warning))]"
                          }`}>
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {stallLevel === "critical" ? "Stalled" : "Possibly stalled"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StageRail stages={parseStagesFromAssembly((a as any).latestStages)} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
                        {a.preset || "\u2014"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {statusEntry ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono-tech text-[hsl(var(--status-processing))]">
                            {formatStallTime(statusEntry.elapsedMs)}
                          </span>
                          {statusEntry.stalledMs > 0 && (
                            <span className={`text-[10px] font-mono-tech ${
                              stallLevel === "critical" ? "text-[hsl(var(--status-failure))]" : stallLevel === "warning" ? "text-[hsl(var(--status-warning))]" : "text-[hsl(var(--muted-foreground))]"
                            }`}>
                              {formatStallTime(statusEntry.stalledMs)} idle
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono-tech">
                          {"\u2014"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono-tech">
                        {formatDuration(a.totalDurationMs)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(a.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setLocation(`/assembly/${a.id}`)}
                          className="p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
                          title="Open Workbench"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this assembly?")) deleteMutation.mutate(a.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded hover:bg-[hsl(var(--status-failure)/0.15)] transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
