import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import {
  Play,
  FolderTree,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Plus,
  ArrowRight,
  Shield,
  Sun,
  Moon,
  Terminal,
  Package,
  Layers,
  Hammer,
  RotateCw,
  Import,
  GitCompare,
} from "lucide-react";
import type {
  WorkspaceInfo,
  RunResult,
  FileEntry,
  FileContent,
  ReleaseGateReport,
} from "@shared/schema";

type Tab = "pipeline" | "files" | "release";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("pipeline");
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${dark ? "dark" : ""}`} style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
      <header
        className="flex items-center justify-between gap-4 px-6 py-3 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            data-testid="logo"
          >
            AX
          </div>
          <h1 className="text-lg font-semibold" data-testid="text-title">AXION Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1" data-testid="nav-tabs">
            <TabButton
              active={activeTab === "pipeline"}
              onClick={() => setActiveTab("pipeline")}
              icon={<Play className="w-4 h-4" />}
              label="Pipeline"
              testId="tab-pipeline"
            />
            <TabButton
              active={activeTab === "files"}
              onClick={() => setActiveTab("files")}
              icon={<FolderTree className="w-4 h-4" />}
              label="Files"
              testId="tab-files"
            />
            <TabButton
              active={activeTab === "release"}
              onClick={() => setActiveTab("release")}
              icon={<Shield className="w-4 h-4" />}
              label="Release Gate"
              testId="tab-release"
            />
          </nav>
          <button
            onClick={toggleDark}
            className="p-2 rounded-md"
            style={{ background: "hsl(var(--muted))" }}
            data-testid="button-theme-toggle"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === "pipeline" && <PipelineTab />}
        {activeTab === "files" && <FilesTab />}
        {activeTab === "release" && <ReleaseTab />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, testId }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      style={{
        background: active ? "hsl(var(--primary))" : "transparent",
        color: active ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
      }}
      data-testid={testId}
    >
      {icon}
      {label}
    </button>
  );
}

function PipelineTab() {
  const [projectName, setProjectName] = useState("my-project");
  const [outputs, setOutputs] = useState<RunResult[]>([]);
  const [expandedOutput, setExpandedOutput] = useState<number | null>(null);
  const [runningStep, setRunningStep] = useState<string | null>(null);

  const { data: workspaces = [], refetch: refetchWorkspaces } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const runStep = useMutation({
    mutationFn: async ({ endpoint, body }: { endpoint: string; body: any }) => {
      return apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
    },
    onMutate: ({ endpoint }) => {
      const step = endpoint.split("/").pop() || "";
      setRunningStep(step);
    },
    onSuccess: (data: RunResult) => {
      setOutputs((prev) => [data, ...prev]);
      setExpandedOutput(0);
      setRunningStep(null);
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
    },
    onError: () => {
      setRunningStep(null);
    },
  });

  const steps = [
    { id: "kit-create", label: "Kit Create", icon: <Plus className="w-4 h-4" />, endpoint: "/api/pipeline/kit-create", desc: "Create a new AXION workspace" },
    { id: "generate", label: "Generate", icon: <Layers className="w-4 h-4" />, endpoint: "/api/pipeline/generate", desc: "Generate module doc packs" },
    { id: "seed", label: "Seed", icon: <Package className="w-4 h-4" />, endpoint: "/api/pipeline/seed", desc: "Seed baseline registry docs" },
    { id: "scaffold-app", label: "Scaffold App", icon: <Hammer className="w-4 h-4" />, endpoint: "/api/pipeline/scaffold-app", desc: "Create app skeleton from docs" },
    { id: "build-plan", label: "Build Plan", icon: <FileText className="w-4 h-4" />, endpoint: "/api/pipeline/build-plan", desc: "Generate ordered task graph" },
    { id: "iterate", label: "Iterate (dry)", icon: <RotateCw className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Run iterate without apply" },
    { id: "iterate-apply", label: "Iterate (apply)", icon: <ArrowRight className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Run iterate with --allow-apply", extra: { allowApply: true } },
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-md p-4"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <h2 className="text-base font-semibold mb-3" data-testid="text-pipeline-header">Run Pipeline</h2>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-1.5 rounded-md text-sm"
            style={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            data-testid="input-project-name"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() =>
                runStep.mutate({
                  endpoint: step.endpoint,
                  body: { projectName, ...(step.extra || {}) },
                })
              }
              disabled={runStep.isPending}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors"
              style={{
                background: runningStep === step.id.split("-")[0]
                  ? "hsl(var(--primary) / 0.1)"
                  : "hsl(var(--muted))",
                opacity: runStep.isPending ? 0.6 : 1,
              }}
              data-testid={`button-step-${step.id}`}
            >
              {runningStep && step.endpoint.includes(runningStep)
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : step.icon}
              <div>
                <div className="font-medium">{step.label}</div>
                <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{step.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {workspaces.length > 0 && (
        <div
          className="rounded-md p-4"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            Workspaces
          </h3>
          <div className="space-y-1">
            {workspaces.map((ws) => (
              <div
                key={ws.projectName}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm"
                style={{ background: "hsl(var(--muted))" }}
                data-testid={`workspace-${ws.projectName}`}
              >
                <FolderTree className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                <span className="font-medium">{ws.projectName}</span>
                <div className="flex gap-2 ml-auto">
                  {ws.hasManifest && <StatusBadge label="manifest" ok />}
                  {ws.hasRegistry && <StatusBadge label="registry" ok />}
                  {ws.hasDomains && <StatusBadge label="domains" ok />}
                  {ws.hasApp && <StatusBadge label="app" ok />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outputs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
            Pipeline Output ({outputs.length} runs)
          </h3>
          {outputs.map((output, i) => (
            <OutputCard
              key={i}
              output={output}
              expanded={expandedOutput === i}
              onToggle={() => setExpandedOutput(expandedOutput === i ? null : i)}
              testId={`output-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{
        background: ok ? "hsl(var(--success) / 0.15)" : "hsl(var(--destructive) / 0.15)",
        color: ok ? "hsl(var(--success))" : "hsl(var(--destructive))",
      }}
    >
      {label}
    </span>
  );
}

function OutputCard({ output, expanded, onToggle, testId }: {
  output: RunResult;
  expanded: boolean;
  onToggle: () => void;
  testId: string;
}) {
  const isSuccess = output.status === "success";

  let parsedJson: any = null;
  try {
    const lines = output.stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    parsedJson = JSON.parse(lastLine);
  } catch {}

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: "1px solid hsl(var(--border))" }}
      data-testid={testId}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ background: "hsl(var(--card))" }}
        data-testid={`${testId}-toggle`}
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {isSuccess
          ? <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
          : <XCircle className="w-4 h-4" style={{ color: "hsl(var(--destructive))" }} />}
        <span className="font-medium text-sm">{output.command}</span>
        <span className="text-xs ml-auto flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          <Clock className="w-3 h-3" />
          {(output.durationMs / 1000).toFixed(1)}s
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: isSuccess ? "hsl(var(--success) / 0.15)" : "hsl(var(--destructive) / 0.15)",
            color: isSuccess ? "hsl(var(--success))" : "hsl(var(--destructive))",
          }}
        >
          exit {output.exitCode}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ background: "hsl(var(--card))" }}>
          {parsedJson && (
            <div className="rounded-md p-3 text-xs" style={{ background: "hsl(var(--muted))" }}>
              <div className="font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Parsed JSON Output</div>
              <pre className="overflow-x-auto whitespace-pre-wrap" style={{ color: "hsl(var(--foreground))" }}>
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
            </div>
          )}
          {output.stdout && (
            <div>
              <div className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Terminal className="w-3 h-3" /> stdout
              </div>
              <pre
                className="rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto"
                style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                data-testid={`${testId}-stdout`}
              >
                {output.stdout || "(empty)"}
              </pre>
            </div>
          )}
          {output.stderr && (
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>stderr</div>
              <pre
                className="rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto"
                style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                data-testid={`${testId}-stderr`}
              >
                {output.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilesTab() {
  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: entries = [], isLoading: loadingEntries } = useQuery<FileEntry[]>({
    queryKey: ["/api/files/browse", currentPath],
    queryFn: () => fetch(`/api/files/browse?path=${encodeURIComponent(currentPath!)}`).then(r => r.json()),
    enabled: !!currentPath,
  });

  const { data: fileContent, isLoading: loadingFile } = useQuery<FileContent>({
    queryKey: ["/api/files/read", selectedFile],
    queryFn: () => fetch(`/api/files/read?path=${encodeURIComponent(selectedFile!)}`).then(r => r.json()),
    enabled: !!selectedFile,
  });

  const selectWorkspace = (ws: WorkspaceInfo) => {
    setSelectedWorkspace(ws.projectName);
    setCurrentPath(ws.path);
    setSelectedFile(null);
  };

  const navigateTo = (entry: FileEntry) => {
    if (entry.type === "directory") {
      setCurrentPath(entry.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(entry.path);
    }
  };

  const navigateUp = () => {
    if (!currentPath || !selectedWorkspace) return;
    const ws = workspaces.find(w => w.projectName === selectedWorkspace);
    if (!ws) return;
    if (currentPath === ws.path) return;
    const parent = currentPath.split("/").slice(0, -1).join("/");
    setCurrentPath(parent);
    setSelectedFile(null);
  };

  const pathParts = currentPath?.split("/").filter(Boolean) || [];
  const wsRoot = workspaces.find(w => w.projectName === selectedWorkspace)?.path || "";

  return (
    <div className="space-y-4">
      {workspaces.length === 0 ? (
        <div
          className="text-center py-16 rounded-md"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <FolderTree className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            No workspaces yet. Run "Kit Create" in the Pipeline tab to create one.
          </p>
        </div>
      ) : !selectedWorkspace ? (
        <div
          className="rounded-md p-4"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <h2 className="text-base font-semibold mb-3" data-testid="text-select-workspace">Select Workspace</h2>
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <button
                key={ws.projectName}
                onClick={() => selectWorkspace(ws)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors"
                style={{ background: "hsl(var(--muted))" }}
                data-testid={`button-workspace-${ws.projectName}`}
              >
                <FolderTree className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                <span className="font-medium">{ws.projectName}</span>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "hsl(var(--muted-foreground))" }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-4" style={{ minHeight: "70vh" }}>
          <div
            className="w-80 shrink-0 rounded-md overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <div className="px-3 py-2 flex items-center gap-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <button
                onClick={() => { setSelectedWorkspace(null); setCurrentPath(null); setSelectedFile(null); }}
                className="text-xs px-2 py-1 rounded"
                style={{ background: "hsl(var(--muted))" }}
                data-testid="button-back-workspaces"
              >
                All
              </button>
              {currentPath !== wsRoot && (
                <button
                  onClick={navigateUp}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: "hsl(var(--muted))" }}
                  data-testid="button-navigate-up"
                >
                  Up
                </button>
              )}
              <span className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                {currentPath?.replace(wsRoot, selectedWorkspace) || ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingEntries ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              ) : (
                <div className="py-1">
                  {entries.map((entry) => (
                    <button
                      key={entry.path}
                      onClick={() => navigateTo(entry)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors"
                      style={{
                        background: selectedFile === entry.path ? "hsl(var(--primary) / 0.1)" : "transparent",
                      }}
                      data-testid={`file-entry-${entry.name}`}
                    >
                      {entry.type === "directory"
                        ? <FolderTree className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--primary))" }} />
                        : <FileText className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />}
                      <span className="truncate">{entry.name}</span>
                      {entry.type === "file" && entry.size !== undefined && (
                        <span className="text-xs ml-auto shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {formatSize(entry.size)}
                        </span>
                      )}
                    </button>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Empty directory
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className="flex-1 rounded-md overflow-hidden flex flex-col"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {selectedFile ? (
              <>
                <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "hsl(var(--border))" }}>
                  <FileText className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                  <span className="text-sm font-medium truncate" data-testid="text-filename">
                    {selectedFile.split("/").pop()}
                  </span>
                  {fileContent && (
                    <span className="text-xs ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {formatSize(fileContent.size)}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {loadingFile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : fileContent ? (
                    <pre
                      className="text-xs whitespace-pre-wrap font-mono"
                      style={{ color: "hsl(var(--foreground))" }}
                      data-testid="text-file-content"
                    >
                      {fileContent.content}
                    </pre>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Select a file to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReleaseTab() {
  const { data: report, isLoading, refetch } = useQuery<ReleaseGateReport | null>({
    queryKey: ["/api/release-gate"],
  });

  const runGate = useMutation({
    mutationFn: () => apiRequest("/api/release-gate/run", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/release-gate"] });
    },
  });

  return (
    <div className="space-y-4">
      <div
        className="rounded-md p-4"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 className="text-base font-semibold" data-testid="text-release-header">Release Gate Report</h2>
          <button
            onClick={() => runGate.mutate()}
            disabled={runGate.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              opacity: runGate.isPending ? 0.6 : 1,
            }}
            data-testid="button-run-release"
          >
            {runGate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Release Check
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !report ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              No release gate report found. Click "Run Release Check" to generate one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-md"
                style={{
                  background: report.passed ? "hsl(var(--success) / 0.15)" : "hsl(var(--destructive) / 0.15)",
                }}
              >
                {report.passed
                  ? <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(var(--success))" }} />
                  : <XCircle className="w-5 h-5" style={{ color: "hsl(var(--destructive))" }} />}
                <span className="font-semibold text-sm" data-testid="text-gate-status">
                  {report.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {new Date(report.generated_at).toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {(report.duration_ms / 1000).toFixed(1)}s total
              </span>
            </div>

            <div className="space-y-2">
              {report.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-md"
                  style={{ background: "hsl(var(--muted))" }}
                  data-testid={`check-${check.id}`}
                >
                  {check.skipped ? (
                    <Clock className="w-4 h-4" style={{ color: "hsl(var(--warning))" }} />
                  ) : check.passed ? (
                    <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
                  ) : (
                    <XCircle className="w-4 h-4" style={{ color: "hsl(var(--destructive))" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{check.name}</div>
                    {check.error_summary && (
                      <div className="text-xs mt-0.5" style={{ color: "hsl(var(--destructive))" }}>
                        {check.error_summary}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {check.test_count !== undefined && (
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {check.test_count} tests
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {(check.duration_ms / 1000).toFixed(1)}s
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: check.passed
                          ? "hsl(var(--success) / 0.15)"
                          : check.skipped
                          ? "hsl(var(--warning) / 0.15)"
                          : "hsl(var(--destructive) / 0.15)",
                        color: check.passed
                          ? "hsl(var(--success))"
                          : check.skipped
                          ? "hsl(var(--warning))"
                          : "hsl(var(--destructive))",
                      }}
                    >
                      {check.skipped ? "SKIP" : check.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {report.failures.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "hsl(var(--destructive))" }}>
                  Failures
                </h3>
                {report.failures.map((f, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-md mb-2"
                    style={{ background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}
                  >
                    <div className="font-medium text-sm">{f.check_id}: {f.reason_code}</div>
                    <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{f.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
