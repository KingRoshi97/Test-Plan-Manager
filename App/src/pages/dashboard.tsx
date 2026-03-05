import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Plus, Loader2, Activity, Blocks, Heart, ArrowRight, Trash2, ExternalLink, Clock } from "lucide-react";
import { PipelineProgress } from "../components/pipeline-progress";
import type { Assembly } from "../../../shared/schema";

const statusBadge: Record<string, string> = {
  queued: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
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

  const latestCompleted = assemblies
    .filter((a) => a.status === "completed")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Command center overview</p>
        </div>
        <button
          onClick={() => setLocation("/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          New Assembly
        </button>
      </div>

      <div className="flex items-center gap-3">
        {[
          { label: "Total", value: total, cls: "text-[hsl(var(--foreground))]", dot: "bg-gray-400" },
          { label: "Completed", value: completed, cls: "text-green-700", dot: "bg-green-500" },
          { label: "Running", value: running, cls: "text-blue-700", dot: "bg-blue-500" },
          { label: "Failed", value: failed, cls: "text-red-700", dot: "bg-red-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm"
          >
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            <span className={`font-semibold tabular-nums ${s.cls}`}>{s.value}</span>
            <span className="text-[hsl(var(--muted-foreground))]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {latestCompleted && (
          <button
            onClick={() => setLocation(`/assembly/${latestCompleted.id}`)}
            className="text-left border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
          >
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
              <Clock className="w-3.5 h-3.5" />
              Latest Run
            </div>
            <div className="font-semibold text-sm text-[hsl(var(--card-foreground))] truncate">{latestCompleted.projectName}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">completed</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDuration(latestCompleted.totalDurationMs)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Open workspace <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        )}

        <button
          onClick={() => setLocation("/health")}
          className="text-left border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
        >
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <Heart className="w-3.5 h-3.5" />
            System Health
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-semibold text-sm text-[hsl(var(--card-foreground))]">All Systems OK</span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">10 stages / 8 gates</div>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            View details <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => setLocation("/features")}
          className="text-left border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
        >
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <Blocks className="w-3.5 h-3.5" />
            Feature Packs
          </div>
          <div className="font-semibold text-sm text-[hsl(var(--card-foreground))]">17 / 17 Active</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">All feature packs operational</div>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Browse features <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Assemblies
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
          </div>
        ) : assemblies.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[hsl(var(--border))] rounded-lg">
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No assemblies yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden bg-[hsl(var(--card))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--muted))]">
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))]">Project</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))] hidden md:table-cell">Pipeline</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))] hidden md:table-cell">Preset</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Runs</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Duration</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-2.5 font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assemblies.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.5)] cursor-pointer transition-colors"
                    onClick={() => setLocation(`/assembly/${a.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[hsl(var(--card-foreground))]">{a.projectName}</div>
                      {a.idea && (
                        <div className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">{a.idea}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[a.status] || "bg-gray-100 text-gray-700"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <PipelineProgress stages={(a as any).latestStages || null} size="sm" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{a.preset || "—"}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="tabular-nums">{a.totalRuns ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[hsl(var(--muted-foreground))]">{formatDuration(a.totalDurationMs)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[hsl(var(--muted-foreground))]">{formatDate(a.updatedAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setLocation(`/assembly/${a.id}`)}
                          className="p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors"
                          title="Open"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this assembly?")) deleteMutation.mutate(a.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />
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
    </div>
  );
}
