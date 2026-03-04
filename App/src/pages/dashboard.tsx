import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { Plus, ExternalLink, Trash2, Loader2 } from "lucide-react";
import type { Assembly } from "../../../shared/schema";

const statusColor: Record<string, string> = {
  queued: "bg-gray-200 text-gray-800",
  running: "bg-blue-200 text-blue-800",
  completed: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
};

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
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
  const queued = assemblies.filter((a) => a.status === "queued").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Dashboard</h1>
        <button
          onClick={() => setLocation("/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          New Assembly
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total", value: total, cls: "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]" },
          { label: "Completed", value: completed, cls: "bg-green-50 text-green-800" },
          { label: "Running", value: running, cls: "bg-blue-50 text-blue-800" },
          { label: "Failed", value: failed, cls: "bg-red-50 text-red-800" },
          { label: "Queued", value: queued, cls: "bg-gray-50 text-gray-800" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 text-center ${s.cls} border border-[hsl(var(--border))]`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : assemblies.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          No assemblies yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assemblies.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg truncate">{a.projectName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[a.status] || "bg-gray-200 text-gray-800"}`}>
                  {a.status}
                </span>
              </div>

              {a.idea && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">{a.idea}</p>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Step</span>
                <span className="truncate">{a.currentStep || "—"}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Verification</span>
                <span className="truncate">{a.verificationStatus || "—"}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Revision</span>
                <span>{a.revision ?? 0}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Kit</span>
                <span className="truncate">{a.kitType || "—"}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Preset</span>
                <span className="truncate">{a.preset || "—"}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Runs</span>
                <span>{a.totalRuns ?? 0}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Duration</span>
                <span>{formatDuration(a.totalDurationMs)}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Created</span>
                <span className="truncate">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[hsl(var(--border))]">
                <button
                  onClick={() => setLocation(`/assembly/${a.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this assembly?")) {
                      deleteMutation.mutate(a.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90 transition disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
