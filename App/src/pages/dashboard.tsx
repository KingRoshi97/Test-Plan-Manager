import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  Plus,
  Loader2,
  Activity,
  Blocks,
  Heart,
  ArrowRight,
  ExternalLink,
  Radio,
  CheckCircle2,
  XCircle,
  Gauge,
  FolderOpen,
  Wrench,
  AlertTriangle,
  Rocket,
  Shield,
  Clock,
  Package,
  Play,
  RotateCcw,
  Search,
  Zap,
  Terminal,
  FileCheck,
  CircleDot,
  Timer,
  Skull,
  X,
} from "lucide-react";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import { usePipelineStatus, getStallLevel, formatStallTime, getAutoKillCountdown } from "../hooks/use-pipeline-status";
import type { Assembly } from "../../../shared/schema";

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatRelativeTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60000) return "just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function formatTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function isToday(d: string | Date | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function getActivityIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--status-success))]" />;
    case "failed":
      return <XCircle className="w-3.5 h-3.5 text-[hsl(var(--status-failure))]" />;
    case "running":
      return <Radio className="w-3.5 h-3.5 text-[hsl(var(--status-processing))] animate-pulse" />;
    case "queued":
      return <Clock className="w-3.5 h-3.5 text-[hsl(var(--status-warning))]" />;
    default:
      return <CircleDot className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />;
  }
}

function getActivityLabel(status: string) {
  switch (status) {
    case "completed": return "Completed";
    case "failed": return "Failed";
    case "running": return "Started";
    case "queued": return "Queued";
    default: return "Updated";
  }
}

interface HealthData {
  status: string;
  pipeline: { stages: number; gates: number };
  knowledge: { kids: number };
  templates: number;
  recentRuns: string[];
}

interface StatsData {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  successRate: number;
  avgDurationMs: number;
  totalTokensUsed: number;
  runsToday: number;
  completedToday: number;
  failedToday: number;
  longestRun: { durationMs: number; projectName: string } | null;
  recentFailureRate: number;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 5000,
  });

  const { data: health } = useQuery<HealthData>({
    queryKey: ["/api/health"],
    queryFn: () => apiRequest("/api/health"),
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("/api/stats"),
    refetchInterval: 30000,
  });

  const retryMutation = useMutation({
    mutationFn: (assemblyId: number) =>
      apiRequest(`/api/assemblies/${assemblyId}/run`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Pipeline restarted");
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to retry: ${err.message}`);
    },
  });

  const hasActiveRuns = assemblies.some((a) => a.status === "running");
  const { data: pipelineStatus } = usePipelineStatus(hasActiveRuns);

  const sorted = [...assemblies].sort(
    (a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
  );

  const total = sorted.length;
  const completed = sorted.filter((a) => a.status === "completed").length;
  const running = sorted.filter((a) => a.status === "running").length;
  const failed = sorted.filter((a) => a.status === "failed").length;
  const queued = sorted.filter((a) => a.status === "queued").length;
  const completedToday = sorted.filter((a) => a.status === "completed" && isToday(a.updatedAt)).length;

  const activeRuns = sorted.filter((a) => a.status === "running");
  const failedRuns = sorted.filter((a) => a.status === "failed");
  const completedRuns = sorted.filter((a) => a.status === "completed");
  const latestFailed = failedRuns[0];
  const latestAssembly = sorted[0];

  const completedWithKits = completedRuns.filter((a) => a.runId);
  const recentOutputs = completedRuns.slice(0, 5);

  const recentEvents = sorted.slice(0, 8);

  const stageCount = health?.pipeline?.stages ?? 10;
  const gateCount = health?.pipeline?.gates ?? 8;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <GlassPanel glow={running > 0 ? "cyan" : "none"} className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.03)] to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                AXION Mission Control
              </h1>
              <StatusChip
                variant={running > 0 ? "processing" : failed > 0 ? "warning" : "success"}
                label={running > 0 ? "LIVE" : failed > 0 ? "ATTENTION" : "ALL CLEAR"}
                pulse={running > 0}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                Development
              </span>
              <span className="text-[hsl(var(--border))]">|</span>
              <span>{stageCount} stages · {gateCount} gates</span>
              <span className="text-[hsl(var(--border))]">|</span>
              <span>{completed} completed · {total} total assemblies</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {latestAssembly && (
              <button
                onClick={() => setLocation(`/assembly/${latestAssembly.id}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition text-sm text-[hsl(var(--foreground))]"
              >
                <Wrench className="w-3.5 h-3.5" />
                Latest Workbench
              </button>
            )}
            <button
              onClick={() => setLocation("/new")}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Assembly
            </button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={Radio}
          label="Active Assemblies"
          value={running}
          accent={running > 0 ? "cyan" : "default"}
          subtitle={running > 0 ? `${activeRuns[0]?.currentStep || "processing"}` : queued > 0 ? `${queued} queued` : "idle"}
          onClick={() => setLocation("/assemblies")}
        />
        <MetricCard
          icon={XCircle}
          label="Failed"
          value={failed}
          accent={failed > 0 ? "red" : "default"}
          subtitle={stats ? `${stats.recentFailureRate}% failure rate` : latestFailed?.error ? latestFailed.error.substring(0, 30) + (latestFailed.error.length > 30 ? "…" : "") : "none"}
          onClick={() => setLocation("/assemblies")}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed Today"
          value={stats?.completedToday ?? completedToday}
          accent="green"
          subtitle={stats?.avgDurationMs ? `avg ${formatDuration(stats.avgDurationMs)}` : `${completed} total`}
        />
        <MetricCard
          icon={Shield}
          label="Gates"
          value={gateCount}
          accent="violet"
          subtitle={`${stageCount} stages`}
        />
        <MetricCard
          icon={Package}
          label="Artifacts Ready"
          value={completedWithKits.length}
          accent="amber"
          subtitle={completedWithKits.length > 0 ? "kits available" : "none ready"}
          onClick={() => setLocation("/files")}
        />
        <MetricCard
          icon={Heart}
          label="System Health"
          value={health?.status === "ok" ? "OK" : "—"}
          accent="green"
          subtitle={stats?.totalTokensUsed ? `${stats.totalTokensUsed.toLocaleString()} tokens used` : `${health?.templates ?? 0} templates`}
          onClick={() => setLocation("/health")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[hsl(var(--status-processing))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Active Operations</span>
            {activeRuns.length > 0 && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{activeRuns.length} running</span>
            )}
          </div>

          {activeRuns.length > 0 ? (
            <div className="space-y-2">
              {activeRuns.map((run) => {
                const statusEntry = pipelineStatus?.activeRuns?.find(
                  (s) => s.assemblyId === run.id
                );
                const stallLevel = statusEntry ? getStallLevel(statusEntry.stalledMs) : "none";
                const glowColor = stallLevel === "critical" ? "red" : stallLevel === "warning" ? "amber" : "cyan";

                return (
                  <GlassPanel
                    key={run.id}
                    glow={glowColor}
                    solid
                    hover
                    onClick={() => setLocation(`/assembly/${run.id}`)}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {run.projectName}
                      </span>
                      <div className="flex items-center gap-2">
                        {stallLevel === "critical" && (
                          <StatusChip variant="failure" label="Stalled" pulse size="sm" />
                        )}
                        {stallLevel === "warning" && (
                          <StatusChip variant="warning" label="Possibly Stalled" size="sm" />
                        )}
                        {stallLevel === "none" && (
                          <StatusChip variant="processing" label="Running" pulse size="sm" />
                        )}
                      </div>
                    </div>
                    {stallLevel === "critical" && statusEntry && (
                      <div className="mb-2 px-2 py-1.5 rounded bg-[hsl(var(--status-failure)/0.08)] border border-[hsl(var(--status-failure)/0.2)] text-[11px] text-[hsl(var(--status-failure))]">
                        <div className="flex items-center gap-1.5">
                          <Skull className="w-3 h-3 flex-shrink-0" />
                          <span>
                            Stalled on {statusEntry.currentStage} — auto-kill in {getAutoKillCountdown(statusEntry.stalledMs, statusEntry.stallTimeoutMs)}s
                          </span>
                        </div>
                      </div>
                    )}
                    {stallLevel === "warning" && statusEntry && (
                      <div className="mb-2 px-2 py-1.5 rounded bg-[hsl(var(--status-warning)/0.08)] border border-[hsl(var(--status-warning)/0.2)] text-[11px] text-[hsl(var(--status-warning))]">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>No activity for {formatStallTime(statusEntry.stalledMs)}</span>
                        </div>
                      </div>
                    )}
                    <div className="mb-2">
                      <StageRail stages={parseStagesFromAssembly((run as any).latestStages)} size="md" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started {formatRelativeTime(run.createdAt)}
                      </span>
                      <div className="flex items-center gap-3">
                        {statusEntry && (
                          <span className="font-mono-tech text-[hsl(var(--status-processing))]">
                            {formatStallTime(statusEntry.elapsedMs)} elapsed
                          </span>
                        )}
                        <span className="font-mono-tech">{formatDuration(run.totalDurationMs)}</span>
                      </div>
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          ) : (
            <GlassPanel solid className="p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted)/0.5)] flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-[hsl(var(--muted-foreground))] opacity-50" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No active operations</p>
              <button
                onClick={() => setLocation("/new")}
                className="mt-2 text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Start a new assembly
              </button>
            </GlassPanel>
          )}
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Activity Timeline</span>
          </div>
          <GlassPanel solid className="p-4 min-h-[140px]">
            {recentEvents.length > 0 ? (
              <div className="space-y-0">
                {recentEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 py-2 cursor-pointer hover:bg-[hsl(var(--accent)/0.3)] rounded px-1.5 -mx-1.5 transition-colors"
                    onClick={() => setLocation(`/assembly/${event.id}`)}
                  >
                    <div className="flex flex-col items-center mt-0.5">
                      {getActivityIcon(event.status)}
                      {idx < recentEvents.length - 1 && (
                        <div className="w-px h-4 bg-[hsl(var(--border)/0.5)] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[hsl(var(--foreground))] truncate">
                          {event.projectName}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] whitespace-nowrap font-mono-tech">
                          {formatRelativeTime(event.updatedAt)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {getActivityLabel(event.status)}
                        {event.totalDurationMs ? ` · ${formatDuration(event.totalDurationMs)}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-8 text-sm text-[hsl(var(--muted-foreground))]">
                No recent activity
              </div>
            )}
          </GlassPanel>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-warning))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Alerts</span>
            {failedRuns.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[hsl(var(--status-failure)/0.15)] text-[hsl(var(--status-failure))]">
                {failedRuns.length}
              </span>
            )}
          </div>
          <GlassPanel solid className="p-4 min-h-[140px]">
            {(() => {
              const visibleFailed = failedRuns.filter((r) => !dismissedAlerts.has(r.id));
              return visibleFailed.length > 0 ? (
                <div className="space-y-2">
                  {visibleFailed.slice(0, 4).map((run) => (
                    <div
                      key={run.id}
                      className="p-2.5 rounded-md bg-[hsl(var(--status-failure)/0.05)] border border-[hsl(var(--status-failure)/0.15)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-medium text-[hsl(var(--foreground))] truncate cursor-pointer hover:underline"
                          onClick={() => setLocation(`/assembly/${run.id}`)}
                        >
                          {run.projectName}
                        </span>
                        <XCircle className="w-3 h-3 text-[hsl(var(--status-failure))] shrink-0" />
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {run.error || "Unknown error"}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {formatRelativeTime(run.updatedAt)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              retryMutation.mutate(run.id);
                            }}
                            disabled={retryMutation.isPending}
                            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)] transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Retry
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDismissedAlerts((prev) => new Set(prev).add(run.id));
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <CheckCircle2 className="w-6 h-6 text-[hsl(var(--status-success))] opacity-50 mb-2" />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">All clear</span>
                </div>
              );
            })()}
          </GlassPanel>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Command Modules</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Start New Assembly",
              icon: Plus,
              desc: "Launch a new assembly",
              href: "/new",
              accent: "primary" as const,
            },
            {
              label: "Resume Assembly",
              icon: RotateCcw,
              desc: failedRuns.length > 0 ? `${failedRuns.length} to resume` : "No pending assemblies",
              href: failedRuns[0] ? `/assembly/${failedRuns[0].id}` : latestAssembly ? `/assembly/${latestAssembly.id}` : "/new",
              accent: "default" as const,
            },
            {
              label: "Latest Workbench",
              icon: Wrench,
              desc: latestAssembly?.projectName || "Open workspace",
              href: latestAssembly ? `/assembly/${latestAssembly.id}` : "/new",
              accent: "default" as const,
            },
            {
              label: "Review Failures",
              icon: AlertTriangle,
              desc: `${failed} failed assembl${failed !== 1 ? "ies" : "y"}`,
              href: "/assemblies",
              accent: "default" as const,
            },
            {
              label: "Artifact Explorer",
              icon: FolderOpen,
              desc: "Browse generated files",
              href: "/files",
              accent: "default" as const,
            },
            {
              label: "Maintenance",
              icon: Gauge,
              desc: "System diagnostics",
              href: "/maintenance",
              accent: "default" as const,
            },
          ].map((action) => (
            <GlassPanel
              key={action.label}
              solid
              hover
              onClick={() => setLocation(action.href)}
              className="p-4 group"
            >
              <action.icon className={`w-5 h-5 mb-2 transition-colors ${
                action.accent === "primary"
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]"
              }`} />
              <div className="text-[13px] font-medium text-[hsl(var(--foreground))]">
                {action.label}
              </div>
              <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                {action.desc}
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

      {recentOutputs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[hsl(var(--status-success))]" />
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Recent Output</span>
            </div>
            <button
              onClick={() => setLocation("/assemblies")}
              className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
            >
              View All Assemblies
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {recentOutputs.map((run) => (
              <GlassPanel
                key={run.id}
                solid
                hover
                onClick={() => setLocation(`/assembly/${run.id}`)}
                className="p-3 min-w-[200px] max-w-[240px] shrink-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[hsl(var(--foreground))] truncate">
                    {run.projectName}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--status-success))] shrink-0" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {formatDuration(run.totalDurationMs)}
                    </span>
                    <span>{formatRelativeTime(run.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {run.preset && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono-tech rounded bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                        {run.preset}
                      </span>
                    )}
                    {run.verificationStatus && (
                      <StatusChip
                        variant={run.verificationStatus === "pass" ? "success" : "warning"}
                        label={String(run.verificationStatus).toUpperCase()}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <StageRail stages={parseStagesFromAssembly((run as any).latestStages)} size="sm" />
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
