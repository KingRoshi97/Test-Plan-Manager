import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  ChevronRight, Play, Trash2, ArrowLeft, CheckCircle, XCircle,
  Clock, Loader2, FileText, Folder, Download, Save, RotateCcw,
  Settings, Layers, Eye, FolderArchive, PenLine
} from "lucide-react";
import { PipelineProgress } from "../components/pipeline-progress";

const FALLBACK_STAGE_ORDER = [
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

const FALLBACK_STAGE_LABELS: Record<string, string> = {
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

function usePipelineConfig() {
  const { data } = useQuery({
    queryKey: ["/api/config"],
    queryFn: () => apiRequest("/api/config"),
    staleTime: 5 * 60 * 1000,
  });

  return {
    stageOrder: (data?.stageOrder as string[]) ?? FALLBACK_STAGE_ORDER,
    stageGates: (data?.stageGates as Record<string, string>) ?? {},
    stageNames: (data?.stageNames as Record<string, string>) ?? FALLBACK_STAGE_LABELS,
  };
}

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

function formatMs(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "intake", label: "Intake", icon: PenLine },
  { id: "artifacts", label: "Artifacts", icon: FolderArchive },
  { id: "config", label: "Config", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

function PipelineTimeline({ stages, stageOrder, stageGates, stageNames }: { stages: Record<string, any> | null; stageOrder: string[]; stageGates: Record<string, string>; stageNames: Record<string, string> }) {
  return (
    <div className="space-y-1">
      {stageOrder.map((stageKey, i) => {
        const stageData = stages?.[stageKey];
        const status = stageData?.status || "pending";
        const gate = stageGates[stageKey];
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: status === "pending" ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}>
                  {stageNames[stageKey] || stageKey}
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

            {i < stageOrder.length - 1 && (
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ArtifactBrowser({ runId, assemblyId }: { runId: string; assemblyId: number }) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
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
        <a
          href={`/api/assemblies/${assemblyId}/kit`}
          download
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
        >
          <Download className="w-3.5 h-3.5" />
          Download Kit
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3 space-y-1 border-[hsl(var(--border))]">
          {(entries as any[]).length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No files found</p>
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
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-[hsl(var(--accent))] text-left transition-colors"
            >
              {entry.type === "directory" ? (
                <Folder className="w-4 h-4 shrink-0 text-[hsl(var(--chart-1))]" />
              ) : (
                <FileText className="w-4 h-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
              )}
              <span>{entry.name}</span>
            </button>
          ))}
        </div>

        {selectedFile && fileContent && (
          <div className="border rounded-lg p-3 overflow-auto max-h-[500px] border-[hsl(var(--border))]">
            <p className="text-xs font-mono mb-2 text-[hsl(var(--muted-foreground))]">{selectedFile}</p>
            <pre className="text-xs whitespace-pre-wrap font-mono text-[hsl(var(--foreground))]">
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

const INTAKE_SECTIONS = [
  { key: "routing", label: "Routing" },
  { key: "project", label: "Project" },
  { key: "intent", label: "Intent" },
  { key: "design", label: "Design" },
  { key: "functional", label: "Functional" },
  { key: "data_model", label: "Data Model" },
  { key: "auth", label: "Auth" },
  { key: "integrations", label: "Integrations" },
  { key: "nfr", label: "NFR" },
  { key: "category_specific", label: "Category Specific" },
  { key: "final", label: "Final" },
];

function IntakeEditor({ assembly, assemblyId }: { assembly: any; assemblyId: number }) {
  const queryClient = useQueryClient();
  const [editedPayload, setEditedPayload] = useState<any>(assembly.intakePayload || {});
  const [activeSection, setActiveSection] = useState("routing");
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSyncedPayload, setLastSyncedPayload] = useState<string>(JSON.stringify(assembly.intakePayload || {}));

  const currentPayloadStr = JSON.stringify(assembly.intakePayload || {});
  if (currentPayloadStr !== lastSyncedPayload && !hasChanges) {
    setEditedPayload(assembly.intakePayload || {});
    setLastSyncedPayload(currentPayloadStr);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      apiRequest(`/api/assemblies/${assemblyId}`, {
        method: "PATCH",
        body: JSON.stringify({ intakePayload: payload }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", String(assemblyId)] });
      setHasChanges(false);
    },
  });

  const saveAndRunMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiRequest(`/api/assemblies/${assemblyId}`, {
        method: "PATCH",
        body: JSON.stringify({ intakePayload: payload }),
      });
      return apiRequest(`/api/assemblies/${assemblyId}/run`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", String(assemblyId)] });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      setHasChanges(false);
    },
  });

  const currentSectionData = editedPayload[activeSection];

  function handleFieldChange(key: string, value: any) {
    setEditedPayload((prev: any) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [key]: value,
      },
    }));
    setHasChanges(true);
  }

  function renderFieldEditor(key: string, value: any) {
    if (value === null || value === undefined) {
      return (
        <input
          type="text"
          value=""
          onChange={(e) => handleFieldChange(key, e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
          placeholder="(empty)"
        />
      );
    }
    if (typeof value === "boolean") {
      return (
        <button
          onClick={() => handleFieldChange(key, !value)}
          className={`px-3 py-1 text-xs rounded-full font-medium ${value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
        >
          {value ? "true" : "false"}
        </button>
      );
    }
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") {
        return (
          <pre className="text-xs font-mono bg-[hsl(var(--muted))] rounded-md p-2 overflow-auto max-h-40 text-[hsl(var(--foreground))]">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      }
      return (
        <textarea
          value={value.join("\n")}
          onChange={(e) => handleFieldChange(key, e.target.value.split("\n").filter(Boolean))}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-[60px] font-mono"
          rows={Math.max(2, Math.min(6, value.length))}
        />
      );
    }
    if (typeof value === "object") {
      return (
        <pre className="text-xs font-mono bg-[hsl(var(--muted))] rounded-md p-2 overflow-auto max-h-40 text-[hsl(var(--foreground))]">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (typeof value === "string" && value.length > 80) {
      return (
        <textarea
          value={value}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-[80px]"
          rows={4}
        />
      );
    }
    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => handleFieldChange(key, e.target.value)}
        className="w-full px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
      />
    );
  }

  if (!assembly.intakePayload || Object.keys(assembly.intakePayload).length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
        <PenLine className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No intake data available for this assembly.</p>
        <p className="text-xs mt-1">Run the pipeline with an intake form to populate this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveMutation.mutate(editedPayload)}
            disabled={!hasChanges || saveMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50 text-[hsl(var(--foreground))]"
          >
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={() => saveAndRunMutation.mutate(editedPayload)}
            disabled={assembly.status === "running" || saveAndRunMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
          >
            {saveAndRunMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Save & Re-run
          </button>
        </div>
      </div>

      {(saveMutation.isError || saveAndRunMutation.isError) && (
        <div className="p-3 rounded-md text-sm bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]">
          {((saveMutation.error || saveAndRunMutation.error) as Error)?.message || "An error occurred"}
        </div>
      )}

      <div className="grid grid-cols-[200px_1fr] gap-4">
        <div className="space-y-0.5">
          {INTAKE_SECTIONS.map((section) => {
            const sectionData = editedPayload[section.key];
            const fieldCount = sectionData ? Object.keys(sectionData).length : 0;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  activeSection === section.key
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                }`}
              >
                <span>{section.label}</span>
                {fieldCount > 0 && (
                  <span className={`text-xs ${activeSection === section.key ? "opacity-70" : "opacity-50"}`}>
                    {fieldCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3 overflow-auto max-h-[600px]">
          {currentSectionData && typeof currentSectionData === "object" ? (
            Object.entries(currentSectionData).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] font-mono">{key}</label>
                {renderFieldEditor(key, value)}
              </div>
            ))
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No data for this section</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ assembly, latestStages, onRun, isRunning, stageOrder }: { assembly: any; latestStages: any; onRun: () => void; isRunning: boolean; stageOrder: string[] }) {
  const passedCount = stageOrder.filter((s) => latestStages?.[s]?.status === "passed").length;
  const failedCount = stageOrder.filter((s) => latestStages?.[s]?.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-5 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Name</span>
              <span className="font-medium text-[hsl(var(--card-foreground))]">{assembly.projectName}</span>
            </div>
            {assembly.idea && (
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Idea</span>
                <span className="text-right max-w-[260px] text-[hsl(var(--card-foreground))]">{assembly.idea}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Preset</span>
              <span className="font-mono text-xs text-[hsl(var(--card-foreground))]">{assembly.preset || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Revision</span>
              <span className="text-[hsl(var(--card-foreground))]">{assembly.revision ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Total Runs</span>
              <span className="text-[hsl(var(--card-foreground))]">{assembly.totalRuns ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Duration</span>
              <span className="text-[hsl(var(--card-foreground))]">{formatMs(assembly.totalDurationMs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Created</span>
              <span className="text-[hsl(var(--card-foreground))]">{formatDate(assembly.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Updated</span>
              <span className="text-[hsl(var(--card-foreground))]">{formatDate(assembly.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-5 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Pipeline Status</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <PipelineProgress stages={latestStages} size="md" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md py-2 bg-green-50 dark:bg-green-950/30">
                <div className="text-lg font-bold text-green-700">{passedCount}</div>
                <div className="text-xs text-green-600">Passed</div>
              </div>
              <div className="rounded-md py-2 bg-red-50 dark:bg-red-950/30">
                <div className="text-lg font-bold text-red-700">{failedCount}</div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
              <div className="rounded-md py-2 bg-gray-50 dark:bg-gray-800/30">
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{10 - passedCount - failedCount}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Verification:</span>
              {assembly.verificationStatus === "PASS" ? (
                <span className="text-xs font-medium text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> PASS</span>
              ) : assembly.verificationStatus === "FAIL" ? (
                <span className="text-xs font-medium text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> FAIL</span>
              ) : (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={assembly.status === "running" || isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Pipeline
        </button>
        {assembly.runId && (
          <a
            href={`/api/assemblies/${assembly.id}/kit`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
          >
            <Download className="w-4 h-4" />
            Download Kit
          </a>
        )}
      </div>
    </div>
  );
}

function PipelineTab({ stages, runs, assemblyId, stageOrder, stageGates, stageNames }: { stages: any; runs: any[]; assemblyId: string; stageOrder: string[]; stageGates: Record<string, string>; stageNames: Record<string, string> }) {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Stage Timeline</h3>
        <PipelineTimeline stages={stages} stageOrder={stageOrder} stageGates={stageGates} stageNames={stageNames} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Run History</h3>
        <div className="border rounded-lg overflow-hidden border-[hsl(var(--border))]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--muted))]">
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Run ID</th>
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Started</th>
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Completed</th>
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Duration</th>
                <th className="text-left px-4 py-2 font-medium text-[hsl(var(--muted-foreground))]">Current Stage</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No pipeline runs yet
                  </td>
                </tr>
              )}
              {runs.map((run: any) => (
                <tr
                  key={run.id}
                  className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.5)] transition-colors"
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
    </div>
  );
}

function ConfigTab({ assembly, onDelete, isDeleting }: { assembly: any; onDelete: () => void; isDeleting: boolean }) {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-5 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Assembly Configuration</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Assembly ID</span>
            <span className="font-mono text-[hsl(var(--card-foreground))]">{assembly.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Preset</span>
            <span className="font-mono text-[hsl(var(--card-foreground))]">{assembly.preset || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Kit Type</span>
            <span className="font-mono text-[hsl(var(--card-foreground))]">{assembly.kitType || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Run ID</span>
            <span className="font-mono text-[hsl(var(--card-foreground))]">{assembly.runId || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Lock Ready</span>
            <span className="text-[hsl(var(--card-foreground))]">{assembly.lockReady || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Current Step</span>
            <span className="font-mono text-xs text-[hsl(var(--card-foreground))]">{assembly.currentStep || "—"}</span>
          </div>
        </div>
      </div>

      {assembly.config && Object.keys(assembly.config).length > 0 && (
        <div className="border rounded-lg p-5 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--card-foreground))] mb-3">Config Object</h3>
          <pre className="text-xs font-mono bg-[hsl(var(--muted))] rounded-md p-3 overflow-auto max-h-64 text-[hsl(var(--foreground))]">
            {JSON.stringify(assembly.config, null, 2)}
          </pre>
        </div>
      )}

      <div className="border rounded-lg p-5 border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.05)]">
        <h3 className="text-sm font-semibold text-[hsl(var(--destructive))] mb-2">Danger Zone</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          Permanently delete this assembly and all associated pipeline runs.
        </p>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90 transition disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Assembly
        </button>
      </div>
    </div>
  );
}

export default function AssemblyPage() {
  const [, params] = useRoute("/assembly/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = params?.id;
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { stageOrder, stageGates, stageNames } = usePipelineConfig();

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
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (error || !assembly) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm hover:underline text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <p className="text-[hsl(var(--destructive))]">Assembly not found</p>
      </div>
    );
  }

  const runs = assembly.runs || [];
  const latestRun = runs.length > 0 ? runs[runs.length - 1] : null;
  const latestStages = latestRun?.stages || null;

  return (
    <div className="space-y-0 max-w-5xl">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm hover:underline text-[hsl(var(--muted-foreground))] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{assembly.projectName}</h1>
            <StatusBadge status={assembly.status} />
          </div>
          {assembly.idea && (
            <p className="text-sm max-w-2xl text-[hsl(var(--muted-foreground))]">{assembly.idea}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runMutation.mutate()}
            disabled={assembly.status === "running" || runMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-50 hover:opacity-90 transition"
          >
            {runMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Pipeline
          </button>
          {assembly.runId && (
            <a
              href={`/api/assemblies/${assembly.id}/kit`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
            >
              <Download className="w-4 h-4" />
              Kit
            </a>
          )}
        </div>
      </div>

      {runMutation.isError && (
        <p className="text-sm text-[hsl(var(--destructive))] mb-4">
          {(runMutation.error as Error).message}
        </p>
      )}
      {assembly.error && (
        <div className="p-3 rounded-md text-sm bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] mb-4">
          {assembly.error}
        </div>
      )}

      <div className="border-b border-[hsl(var(--border))] mb-6">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                    : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          assembly={assembly}
          latestStages={latestStages}
          onRun={() => runMutation.mutate()}
          isRunning={runMutation.isPending}
          stageOrder={stageOrder}
        />
      )}

      {activeTab === "pipeline" && (
        <PipelineTab
          stages={latestStages}
          runs={runs}
          assemblyId={id!}
          stageOrder={stageOrder}
          stageGates={stageGates}
          stageNames={stageNames}
        />
      )}

      {activeTab === "intake" && (
        <IntakeEditor assembly={assembly} assemblyId={Number(id)} />
      )}

      {activeTab === "artifacts" && assembly.runId && (
        <ArtifactBrowser runId={assembly.runId} assemblyId={assembly.id} />
      )}
      {activeTab === "artifacts" && !assembly.runId && (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <FolderArchive className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No artifacts yet. Run the pipeline to generate output files.</p>
        </div>
      )}

      {activeTab === "config" && (
        <ConfigTab
          assembly={assembly}
          onDelete={() => {
            if (confirm("Are you sure you want to delete this assembly?")) {
              deleteMutation.mutate();
            }
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
