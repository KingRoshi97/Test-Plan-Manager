import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { ScrollText, Filter } from "lucide-react";
import type { Assembly } from "../../../shared/schema";

const statusColor: Record<string, string> = {
  queued: "bg-gray-200 text-gray-800",
  running: "bg-blue-200 text-blue-800",
  completed: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
};

const statusFilters = ["all", "running", "completed", "failed", "queued"] as const;

export default function LogsPage() {
  const [filter, setFilter] = useState<string>("all");

  const { data: assemblies = [], isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    queryFn: () => apiRequest("/api/assemblies"),
  });

  const filtered = filter === "all"
    ? assemblies
    : assemblies.filter((a) => a.status === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Run Logs</h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>View recent pipeline runs across all assemblies</p>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
        <div className="flex gap-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                filter === s ? "font-medium" : ""
              }`}
              style={{
                background: filter === s ? "hsl(var(--primary))" : "hsl(var(--muted))",
                color: filter === s ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading...</p>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12">
          <ScrollText className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p style={{ color: "hsl(var(--muted-foreground))" }}>No runs found</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(var(--muted))" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Assembly</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Run ID</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Status</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Current Step</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Created</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((assembly) => (
                <tr
                  key={assembly.id}
                  className="border-t"
                  style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "hsl(var(--foreground))" }}>
                    {assembly.projectName}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}>
                      {assembly.runId || "—"}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[assembly.status] || ""}`}>
                      {assembly.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {assembly.currentStep || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {new Date(assembly.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {new Date(assembly.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
