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
  Trash2,
  ExternalLink,
  Radio,
  CheckCircle2,
  XCircle,
  Gauge,
  FolderOpen,
  Wrench,
  AlertTriangle,
  Rocket,
  Search,
} from "lucide-react";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { StageRail, parseStagesFromAssembly } from "../components/ui/stage-rail";
import type { Assembly } from "../../../shared/schema";

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/assemblies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
  });

  const total = assemblies.length;
  const completed = assemblies.filter((a) => a.status === "completed").length;
  const running = assemblies.filter((a) => a.status === "running").length;
  const failed = assemblies.filter((a) => a.status === "failed").length;
  const queued = assemblies.filter((a) => a.status === "queued").length;

  const activeRuns = assemblies.filter((a) => a.status === "running");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
              AXION Mission Control
            </h1>
            <StatusChip
              variant={running > 0 ? "processing" : failed > 0 ? "warning" : "success"}
              label={running > 0 ? "LIVE" : failed > 0 ? "ATTENTION" : "ALL CLEAR"}
              pulse={running > 0}
              size="sm"
            />
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            System overview and operational control
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard icon={Activity} label="Total Runs" value={total} accent="default" />
        <MetricCard
          icon={Radio}
          label="Active"
          value={running}
          accent="cyan"
          subtitle={queued > 0 ? `${queued} queued` : undefined}
        />
        <MetricCard icon={CheckCircle2} label="Completed" value={completed} accent="green" />
        <MetricCard
          icon={XCircle}
          label="Failed"
          value={failed}
          accent={failed > 0 ? "red" : "default"}
        />
        <MetricCard
          icon={Heart}
          label="System"
          value="OK"
          accent="green"
          subtitle="10 stages · 8 gates"
          onClick={() => setLocation("/health")}
        />
        <MetricCard
          icon={Blocks}
          label="Features"
          value="17"
          accent="violet"
          subtitle="All active"
          onClick={() => setLocation("/features")}
        />
      </div>

      {activeRuns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-[hsl(var(--status-processing))] animate-pulse-glow" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Active Operations
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {activeRuns.length} running
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeRuns.map((run) => (
              <GlassPanel
                key={run.id}
                glow="cyan"
                solid
                hover
                onClick={() => setLocation(`/assembly/${run.id}`)}
                className="p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                    {run.projectName}
                  </span>
                  <StatusChip variant="processing" label="Running" pulse size="sm" />
                </div>
                <div className="mb-2">
                  <StageRail stages={parseStagesFromAssembly((run as any).latestStages)} size="md" />
                </div>
                <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>Started {formatDate(run.createdAt)}</span>
                  <span className="font-mono-tech">{formatDuration(run.totalDurationMs)}</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              All Runs
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : assemblies.length === 0 ? (
          <GlassPanel solid className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No runs yet. Launch your first run to get started.
            </p>
            <button
              onClick={() => setLocation("/new")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Run
            </button>
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
                  <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Duration</th>
                  <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-2.5 text-system-label">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assemblies.map((a) => (
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
                      <StatusChip
                        variant={getStatusVariant(a.status)}
                        label={a.status}
                        pulse={a.status === "running"}
                      />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StageRail stages={parseStagesFromAssembly((a as any).latestStages)} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
                        {a.preset || "—"}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Start New Run",
              icon: Plus,
              desc: "Launch a new assembly",
              href: "/new",
            },
            {
              label: "Open Workbench",
              icon: Wrench,
              desc: "Latest assembly workspace",
              href: assemblies[0] ? `/assembly/${assemblies[0].id}` : "/new",
            },
            {
              label: "Review Failures",
              icon: AlertTriangle,
              desc: `${failed} failed run${failed !== 1 ? "s" : ""}`,
              href: "/",
            },
            {
              label: "Artifact Explorer",
              icon: FolderOpen,
              desc: "Browse generated files",
              href: "/files",
            },
          ].map((action) => (
            <GlassPanel
              key={action.label}
              solid
              hover
              onClick={() => setLocation(action.href)}
              className="p-4 group"
            >
              <action.icon className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors mb-2" />
              <div className="text-[13px] font-medium text-[hsl(var(--foreground))]">
                {action.label}
              </div>
              <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                {action.desc}
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
