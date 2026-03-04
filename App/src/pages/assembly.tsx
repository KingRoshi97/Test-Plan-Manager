import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { ChevronRight, Play, Trash2, ArrowLeft, CheckCircle, XCircle, Clock, Loader2, FileText, Folder } from "lucide-react";

const STAGE_ORDER = [
  "S1_INGEST_NORMALIZE",
  "S2_VALIDATE_INTAKE",
  "S3_BUILD_CANONICAL",
  "S4_VALIDATE_CANONICAL",
  "S5_RESOLVE_STANDARDS",
  "S6_SELECT_TEMPLATES",
  "S7_RENDER_DOCS",
  "S8_BUILD_PLAN",
  "S9_VERIFY_PROOF",
  "S10_PACKAGE",
];

const STAGE_GATES: Record<string, string> = {
  S2_VALIDATE_INTAKE: "G1_INTAKE_VALIDITY",
  S4_VALIDATE_CANONICAL: "G2_CANONICAL_INTEGRITY",
  S5_RESOLVE_STANDARDS: "G3_STANDARDS_RESOLVED",
  S6_SELECT_TEMPLATES: "G4_TEMPLATE_SELECTION",
  S7_RENDER_DOCS: "G5_TEMPLATE_COMPLETENESS",
  S8_BUILD_PLAN: "G6_PLAN_COVERAGE",
  S10_PACKAGE: "G8_PACKAGE_INTEGRITY",
};

const STAGE_LABELS: Record<string, string> = {
  S1_INGEST_NORMALIZE: "Ingest & Normalize",
  S2_VALIDATE_INTAKE: "Validate Intake",
  S3_BUILD_CANONICAL: "Build Canonical",
  S4_VALIDATE_CANONICAL: "Validate Canonical",
  S5_RESOLVE_STANDARDS: "Resolve Standards",
  S6_SELECT_TEMPLATES: "Select Templates",
  S7_RENDER_DOCS: "Render Docs",
  S8_BUILD_PLAN: "Build Plan",
  S9_VERIFY_PROOF: "Verify Proof",
  S10_PACKAGE: "Package",
};

function statusColor(status: string) {
  switch (status) {
    case "passed":
    case "completed":
      return "hsl(var(--chart-2))";
    case "failed":
      return "hsl(var(--destructive))";
    case "running":
      return "hsl(var(--chart-1))";
    default:
      return "hsl(var(--muted-foreground))";
  }
}

function StatusBadge({ status }: { status: string }) {
  const bgMap: Record<string, string> = {
    queued: "bg-gray-100 text-gray-700",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    passed: "bg-green-100 text-green-700",
    pending: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgMap[status] || bgMap.pending}`}>
      {status}
    </span>
  );
}

function formatDuration(start: string, end?: string | null) {
  if (!start) return "-";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = e - s;
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
  return `${(diff / 60000).toFixed(1)}m`;
}

function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function PipelineTimeline({ stages }: { stages: Record<string, any> | null }) {
  return (
    <div className="space-y-1">
      {STAGE_ORDER.map((stageKey, i) => {
        const stageData = stages?.[stageKey];
        const status = stageData?.status || "pending";
        const gate = STAGE_GATES[stageKey];
        const gateResult = stageData?.gateResult;
        const color = statusColor(status);

        return (
          <div key={stageKey} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0" style={{ borderColor: color }}>
              {status === "passed" || status === "completed" ? (
                <CheckCircle className="w-4 h-4" style={{ color }} />
              ) : status === "failed" ? (
                <XCircle className="w-4 h-4" style={{ color }} />
              ) : status === "running" ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
              ) : (
                <Clock className="w-4 h-4" style={{ color }} />
              )}
            </div>

            {i < STAGE_ORDER.length - 1 && (
              <div className="absolute ml-4 mt-10 w-0.5 h-4" style={{ backgroundColor: color }} />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: status === "pending" ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}>
                  {STAGE_LABELS[stageKey] || stageKey}
                </span>
                <StatusBadge status={status} />
                {gate && (
                  <span className="text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                    {gate}
                    {gateResult && (
                      <span className={gateResult === "PASS" ? " text-green-600" : " text-red-600"}>
                        {" "}{gateResult}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {i < STAGE_ORDER.length - 1 && (
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ArtifactBrowser({ runId }: { runId: string }) {
  const [currentPath, setCurrentPath] = useState(runId);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: entries = [] } = useQuery({
    queryKey: ["/api/files", currentPath],
    queryFn: () => apiRequest(`/api/files?dir=${encodeURIComponent(currentPath)}`),
  });

  const { data: fileContent } = useQuery({
    queryKey: ["/api/files/content", selectedFile],
    queryFn: () => apiRequest(`/api/files/${encodeURIComponent(selectedFile!)}`),
    enabled: !!selectedFile,
  });

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        <button onClick={() => { setCurrentPath(runId); setSelectedFile(null); }} className="hover:underline">
          {runId}
        </button>
        {pathParts.slice(1).map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => { setCurrentPath(pathParts.slice(0, i + 2).join("/")); setSelectedFile(null); }}
              className="hover:underline"
            >
              {part}
            </button>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3 space-y-1" style={{ borderColor: "hsl(var(--border))" }}>
          {(entries as any[]).length === 0 && (
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No files found</p>
          )}
          {(entries as any[]).map((entry: any) => (
            <button
              key={entry.path}
              onClick={() => {
                if (entry.type === "directory") {
                  setCurrentPath(entry.path);
                  setSelectedFile(null);
                } else {
                  setSelectedFile(entry.path);
                }
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              {entry.type === "directory" ? (
                <Folder className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--chart-1))" }} />
              ) : (
                <FileText className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
              )}
              <span>{entry.name}</span>
            </button>
          ))}
        </div>

        {selectedFile && fileContent && (
          <div className="border rounded-lg p-3 overflow-auto max-h-96" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-xs font-mono mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{selectedFile}</p>
            <pre className="text-xs whitespace-pre-wrap font-mono" style={{ color: "hsl(var(--foreground))" }}>
              {typeof fileContent.content === "object"
                ? JSON.stringify(fileContent.content, null, 2)
                : fileContent.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssemblyPage() {
  const [, params] = useRoute("/assembly/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = params?.id;

  const { data: assembly, isLoading, error } = useQuery({
    queryKey: ["/api/assemblies", id],
    queryFn: () => apiRequest(`/api/assemblies/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const d = query.state.data as any;
      return d?.status === "running" ? 2000 : false;
    },
  });

  const runMutation = useMutation({
    mutationFn: () => apiRequest(`/api/assemblies/${id}/run`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/assemblies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
    );
  }

  if (error || !assembly) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm hover:underline" style={{ color: "hsl(var(--muted-foreground))" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <p style={{ color: "hsl(var(--destructive))" }}>Assembly not found</p>
      </div>
    );
  }

  const runs = assembly.runs || [];
  const latestRun = runs.length > 0 ? runs[runs.length - 1] : null;
  const latestStages = latestRun?.stages || null;

  return (
    <div className="space-y-8 max-w-5xl">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm hover:underline" style={{ color: "hsl(var(--muted-foreground))" }}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{assembly.projectName}</h1>
              <StatusBadge status={assembly.status} />
            </div>
            {assembly.idea && (
              <p className="text-sm max-w-2xl" style={{ color: "hsl(var(--muted-foreground))" }}>{assembly.idea}</p>
            )}
            {assembly.preset && (
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Preset: {assembly.preset}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runMutation.mutate()}
              disabled={assembly.status === "running" || runMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "hsl(var(--primary))" }}
            >
              {runMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Pipeline
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this assembly?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border hover:bg-red-50 dark:hover:bg-red-950"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--destructive))" }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {runMutation.isError && (
          <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>
            {(runMutation.error as Error).message}
          </p>
        )}
        {assembly.error && (
          <div className="p-3 rounded-md text-sm" style={{ backgroundColor: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
            {assembly.error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>Pipeline Stages</h2>
        <div className="border rounded-lg p-4" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}>
          <PipelineTimeline stages={latestStages} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>Run History</h2>
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "hsl(var(--muted))" }}>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Run ID</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Status</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Started</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Completed</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Duration</th>
                <th className="text-left px-4 py-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Current Stage</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                    No pipeline runs yet
                  </td>
                </tr>
              )}
              {runs.map((run: any) => (
                <tr
                  key={run.id}
                  className="border-t cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  style={{ borderColor: "hsl(var(--border))" }}
                  onClick={() => navigate(`/assembly/${id}`)}
                >
                  <td className="px-4 py-2 font-mono text-xs">{run.runId}</td>
                  <td className="px-4 py-2"><StatusBadge status={run.status} /></td>
                  <td className="px-4 py-2">{formatDate(run.startedAt)}</td>
                  <td className="px-4 py-2">{formatDate(run.completedAt)}</td>
                  <td className="px-4 py-2">{formatDuration(run.startedAt, run.completedAt)}</td>
                  <td className="px-4 py-2 text-xs font-mono">{run.currentStage || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assembly.runId && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>Artifacts</h2>
          <div className="border rounded-lg p-4" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}>
            <ArtifactBrowser runId={assembly.runId} />
          </div>
        </div>
      )}
    </div>
  );
}
