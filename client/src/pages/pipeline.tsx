import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Layers,
  Package,
  Hammer,
  FileText,
  RotateCw,
  ArrowRight,
  FolderTree,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Terminal,
  Search,
  GitCompare,
  Stethoscope,
  PenLine,
  Eye,
  ShieldCheck,
  Lock,
  FlaskConical,
  Power,
  Import,
  Sparkles,
  Trash2,
  PackageOpen,
  Play,
  Square,
  Zap,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { WorkspaceInfo, RunResult, PipelineRun } from "@shared/schema";

interface StepDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  desc: string;
  extra?: Record<string, unknown>;
  needsSourcePath?: boolean;
  needsModule?: boolean;
}

interface StepGroup {
  id: string;
  label: string;
  desc: string;
  steps: StepDef[];
}

interface ModuleInfo {
  name: string;
  hasBels: boolean;
  hasErc: boolean;
  stages: Record<string, string>;
}

const stepGroups: StepGroup[] = [
  {
    id: "setup",
    label: "Setup",
    desc: "Initialize and scaffold workspace",
    steps: [
      { id: "kit-create", label: "Kit Create", icon: <Plus className="w-4 h-4" />, endpoint: "/api/pipeline/kit-create", desc: "Initialize workspace" },
      { id: "generate", label: "Generate", icon: <Layers className="w-4 h-4" />, endpoint: "/api/pipeline/generate", desc: "Generate doc structure" },
      { id: "seed", label: "Seed", icon: <Package className="w-4 h-4" />, endpoint: "/api/pipeline/seed", desc: "Seed baseline docs" },
    ],
  },
  {
    id: "docs",
    label: "Docs Pipeline",
    desc: "Draft, review, verify, and lock documentation",
    steps: [
      { id: "draft", label: "Draft", icon: <PenLine className="w-4 h-4" />, endpoint: "/api/pipeline/draft", desc: "Draft documentation", needsModule: true },
      { id: "review", label: "Review", icon: <Eye className="w-4 h-4" />, endpoint: "/api/pipeline/review", desc: "Review for issues", needsModule: true },
      { id: "verify", label: "Verify", icon: <ShieldCheck className="w-4 h-4" />, endpoint: "/api/pipeline/verify", desc: "Verify completeness", needsModule: true },
      { id: "lock", label: "Lock", icon: <Lock className="w-4 h-4" />, endpoint: "/api/pipeline/lock", desc: "Lock for build (requires module)", needsModule: true },
    ],
  },
  {
    id: "build",
    label: "Build & Deploy",
    desc: "Scaffold, plan, build, test, and activate",
    steps: [
      { id: "scaffold-app", label: "Scaffold App", icon: <Hammer className="w-4 h-4" />, endpoint: "/api/pipeline/scaffold-app", desc: "App boilerplate" },
      { id: "build-plan", label: "Build Plan", icon: <FileText className="w-4 h-4" />, endpoint: "/api/pipeline/build-plan", desc: "Generate task list" },
      { id: "iterate", label: "Iterate (dry)", icon: <RotateCw className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Dry run" },
      { id: "iterate-apply", label: "Iterate (apply)", icon: <ArrowRight className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Apply changes", extra: { allowApply: true } },
      { id: "build", label: "Build", icon: <Hammer className="w-4 h-4" />, endpoint: "/api/pipeline/build", desc: "Execute build" },
      { id: "test", label: "Test", icon: <FlaskConical className="w-4 h-4" />, endpoint: "/api/pipeline/test", desc: "Run workspace tests" },
      { id: "activate", label: "Activate", icon: <Power className="w-4 h-4" />, endpoint: "/api/pipeline/activate", desc: "Set active build" },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
    desc: "Import, reconcile, diagnose",
    steps: [
      { id: "import", label: "Import", icon: <Import className="w-4 h-4" />, endpoint: "/api/pipeline/import", desc: "Analyze existing repo", needsSourcePath: true },
      { id: "reconcile", label: "Reconcile", icon: <GitCompare className="w-4 h-4" />, endpoint: "/api/pipeline/reconcile", desc: "Check drift" },
      { id: "doctor", label: "Doctor", icon: <Stethoscope className="w-4 h-4" />, endpoint: "/api/pipeline/doctor", desc: "System health check" },
      { id: "next", label: "Next Steps", icon: <Sparkles className="w-4 h-4" />, endpoint: "/api/pipeline/next", desc: "Recommendations" },
      { id: "docs-check", label: "Docs Check", icon: <Search className="w-4 h-4" />, endpoint: "/api/pipeline/docs-check", desc: "Check doc health" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    desc: "Package and clean",
    steps: [
      { id: "deploy", label: "Deploy", icon: <ArrowRight className="w-4 h-4" />, endpoint: "/api/pipeline/deploy", desc: "Deploy application" },
      { id: "overhaul", label: "Overhaul", icon: <RotateCw className="w-4 h-4" />, endpoint: "/api/pipeline/overhaul", desc: "System overhaul" },
      { id: "package", label: "Package", icon: <PackageOpen className="w-4 h-4" />, endpoint: "/api/pipeline/package", desc: "Bundle Agent Kit" },
      { id: "clean", label: "Clean", icon: <Trash2 className="w-4 h-4" />, endpoint: "/api/pipeline/clean", desc: "Clean artifacts" },
    ],
  },
];

function parseBlockedByMessage(stdout: string, stderr: string): string | null {
  const combined = stdout + "\n" + stderr;
  try {
    const lines = combined.trim().split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        if (parsed.status === "blocked_by") {
          const missing = Array.isArray(parsed.missing) ? parsed.missing.join(", ") : "";
          const hint = Array.isArray(parsed.hint) ? parsed.hint.join("; ") : "";
          return `Blocked: missing ${missing}. ${hint}`;
        }
        if (parsed.error) {
          return `Error: ${parsed.error}`;
        }
      }
    }
  } catch {}
  const errLine = stderr.split("\n").filter(Boolean).pop();
  if (errLine && errLine.includes("--module")) {
    return "This step requires a module to be selected. Choose a module from the dropdown.";
  }
  return null;
}

export default function PipelinePage() {
  const [projectName, setProjectName] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [outputs, setOutputs] = useState<RunResult[]>([]);
  const [expandedOutput, setExpandedOutput] = useState<number | null>(null);
  const [runningStep, setRunningStep] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState<string>("");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  const { data: modules = [] } = useQuery<ModuleInfo[]>({
    queryKey: ["/api/modules", projectName],
    queryFn: async () => {
      if (!projectName) return [];
      const res = await fetch(`/api/modules/${encodeURIComponent(projectName)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!projectName,
  });

  useEffect(() => {
    if (!projectName && workspaces.length > 0) {
      setProjectName(workspaces[0].projectName);
    }
  }, [workspaces, projectName]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const runStep = async (step: StepDef) => {
    if (runningStep) return;

    if (!projectName) {
      toast({ title: "No workspace selected", description: "Select or create a workspace first.", variant: "destructive" });
      return;
    }

    if (step.id === "lock" && !selectedModule) {
      toast({ title: "Module required for Lock", description: "The Lock step requires a specific module. Select one from the module dropdown.", variant: "destructive" });
      return;
    }

    setRunningStep(step.id);
    setStreamingOutput("");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const body: Record<string, unknown> = { projectName, ...(step.extra || {}) };
    if (step.needsSourcePath && sourcePath) {
      body.sourcePath = sourcePath;
    }
    if (step.needsModule && selectedModule) {
      body.module = selectedModule;
    }

    const params = new URLSearchParams({ body: JSON.stringify(body) });
    const url = `${step.endpoint}/stream?${params.toString()}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;
    let accumulated = "";

    es.addEventListener("stdout", (e) => {
      accumulated += e.data + "\n";
      setStreamingOutput(accumulated);
    });

    es.addEventListener("stderr", (e) => {
      accumulated += "[stderr] " + e.data + "\n";
      setStreamingOutput(accumulated);
    });

    es.addEventListener("done", (e) => {
      es.close();
      eventSourceRef.current = null;
      try {
        const result: RunResult = JSON.parse(e.data);
        setOutputs((prev) => [result, ...prev]);
        setExpandedOutput(0);
        if (result.status === "success") {
          toast({ title: `${step.label} completed`, variant: "success" });
        } else {
          const blockedMsg = parseBlockedByMessage(result.stdout, result.stderr);
          const errSummary = blockedMsg || result.stderr?.split("\n").filter(Boolean).slice(-2).join(" ") || "Unknown error";
          toast({
            title: `${step.label} failed (exit ${result.exitCode})`,
            description: errSummary.slice(0, 200),
            variant: "destructive",
          });
        }
      } catch {
        toast({ title: `${step.label} finished`, variant: "default" });
      }
      setRunningStep(null);
      setStreamingOutput("");
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules", projectName] });
    });

    es.addEventListener("error", () => {
      es.close();
      eventSourceRef.current = null;
      setRunningStep(null);
      setStreamingOutput("");
      toast({ title: `${step.label} connection lost`, variant: "destructive" });
    });
  };

  const hasWorkspace = workspaces.length > 0;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-pipeline-header">Pipeline</h2>
        <p className="text-sm text-muted-foreground mt-1">Run AXION pipeline steps to build your project.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
          <CardTitle className="text-sm">Workspace</CardTitle>
          {hasWorkspace && (
            <Badge variant="success" className="no-default-active-elevate">
              {workspaces.length} detected
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {hasWorkspace ? (
            <div className="flex gap-1.5 flex-wrap">
              {workspaces.map((ws) => (
                <Button
                  key={ws.projectName}
                  variant={projectName === ws.projectName ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setProjectName(ws.projectName);
                    setSelectedModule("");
                  }}
                  data-testid={`button-ws-${ws.projectName}`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  {ws.projectName}
                  <div className="flex gap-0.5 ml-1">
                    {ws.hasManifest && <Badge variant="success" className="no-default-active-elevate text-[10px] px-1 py-0">M</Badge>}
                    {ws.hasRegistry && <Badge variant="success" className="no-default-active-elevate text-[10px] px-1 py-0">R</Badge>}
                    {ws.hasDomains && <Badge variant="success" className="no-default-active-elevate text-[10px] px-1 py-0">D</Badge>}
                    {ws.hasApp && <Badge variant="success" className="no-default-active-elevate text-[10px] px-1 py-0">A</Badge>}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                No workspace detected. Enter a project name to create one.
              </div>
            </div>
          )}

          {!hasWorkspace && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-muted-foreground w-20 shrink-0">Project</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-project"
                className="max-w-xs"
                data-testid="input-project-name"
              />
            </div>
          )}

          <button
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            className="flex items-center gap-1 text-xs text-muted-foreground"
            data-testid="button-advanced-config"
          >
            {showAdvancedConfig ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Advanced options
          </button>

          {showAdvancedConfig && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {hasWorkspace && (
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs text-muted-foreground w-20 shrink-0">Project</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="max-w-xs"
                    data-testid="input-project-name"
                  />
                  <span className="text-xs text-muted-foreground">Create a new workspace by typing a new name</span>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs text-muted-foreground w-20 shrink-0">Source Path</label>
                <Input
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="Path to existing repo (for Import step)"
                  className="max-w-md"
                  data-testid="input-source-path"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs text-muted-foreground w-20 shrink-0">Module</label>
                {modules.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-module"
                    >
                      <option value="">All modules</option>
                      {modules.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} {m.hasErc ? "(locked)" : m.hasBels ? "(has BELS)" : ""}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">
                      {modules.length} modules found. Lock requires a specific module.
                    </span>
                  </div>
                ) : (
                  <Input
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    placeholder="Run generate first to discover modules"
                    className="max-w-md"
                    data-testid="input-module-filter"
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PresetsPanel
        projectName={projectName}
        disabled={!!runningStep}
      />

      <div>
        <button
          onClick={() => setShowManualSteps(!showManualSteps)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-3"
          data-testid="button-toggle-manual-steps"
        >
          {showManualSteps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Individual Steps
          <span className="text-xs">(run steps manually)</span>
        </button>

        {showManualSteps && (
          <div className="space-y-4">
            {stepGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{group.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{group.desc}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {group.steps.map((step) => {
                      const isLockWithoutModule = step.id === "lock" && !selectedModule;
                      return (
                        <Button
                          key={step.id}
                          variant="secondary"
                          onClick={() => runStep(step)}
                          disabled={!!runningStep || isLockWithoutModule}
                          className="justify-start gap-2 h-auto py-2 px-3"
                          data-testid={`button-step-${step.id}`}
                        >
                          {runningStep === step.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : step.icon}
                          <div className="text-left">
                            <div className="text-xs font-medium">{step.label}</div>
                            <div className="text-xs text-muted-foreground">{step.desc}</div>
                          </div>
                          {isLockWithoutModule && (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0 ml-auto" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {streamingOutput && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <CardTitle className="text-sm">Live Output</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <pre
                className="text-xs font-mono whitespace-pre-wrap p-3 rounded-md bg-muted"
                data-testid="text-streaming-output"
              >
                {streamingOutput}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {outputs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Session Runs ({outputs.length})
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

      <PipelineRunHistory projectName={projectName} />
    </div>
  );
}

function OutputCard({ output, expanded, onToggle, testId }: {
  output: RunResult;
  expanded: boolean;
  onToggle: () => void;
  testId: string;
}) {
  const isSuccess = output.status === "success";

  let parsedJson: Record<string, unknown> | null = null;
  try {
    const lines = output.stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    parsedJson = JSON.parse(lastLine);
  } catch {}

  const blockedMsg = !isSuccess ? parseBlockedByMessage(output.stdout, output.stderr) : null;

  return (
    <Card data-testid={testId}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        data-testid={`${testId}-toggle`}
      >
        {expanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
        {isSuccess
          ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
        <span className="font-medium text-sm">{output.command}</span>
        <span className="text-xs ml-auto flex items-center gap-1 text-muted-foreground shrink-0">
          <Clock className="w-3 h-3" />
          {(output.durationMs / 1000).toFixed(1)}s
        </span>
        <Badge variant={isSuccess ? "success" : "error"} className="no-default-active-elevate shrink-0">
          exit {output.exitCode}
        </Badge>
      </button>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {blockedMsg && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-sm" data-testid={`${testId}-blocked`}>
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <span className="text-yellow-800 dark:text-yellow-300">{blockedMsg}</span>
            </div>
          )}
          {parsedJson && (
            <div className="rounded-md p-3 bg-muted text-xs">
              <div className="font-semibold mb-1 text-muted-foreground">Parsed JSON</div>
              <pre className="overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
            </div>
          )}
          {output.stdout && (
            <div>
              <div className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
                <Terminal className="w-3 h-3" /> stdout
              </div>
              <ScrollArea className="max-h-64">
                <pre
                  className="rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-background border"
                  data-testid={`${testId}-stdout`}
                >
                  {output.stdout || "(empty)"}
                </pre>
              </ScrollArea>
            </div>
          )}
          {output.stderr && (
            <div>
              <div className="text-xs font-medium mb-1 text-muted-foreground">stderr</div>
              <ScrollArea className="max-h-40">
                <pre
                  className="rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-background border text-red-700 dark:text-red-400"
                  data-testid={`${testId}-stderr`}
                >
                  {output.stderr}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface StagePlanEntry {
  label?: string;
  description?: string;
  steps: string[];
}

interface PresetsData {
  stage_plans: Record<string, StagePlanEntry | string[]>;
  presets: Record<string, {
    label: string;
    description: string;
    modules: string[];
    include_dependencies?: boolean;
    recommended_stage_plan?: string;
    guards?: Record<string, boolean>;
  }>;
}

interface PresetStepProgress {
  index: number;
  stepId: string;
  label: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  durationMs?: number;
  reason?: string;
}

function PresetsPanel({ projectName, disabled }: { projectName: string; disabled: boolean }) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedStagePlan, setSelectedStagePlan] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stepProgress, setStepProgress] = useState<PresetStepProgress[]>([]);
  const [presetOutput, setPresetOutput] = useState("");
  const [runSummary, setRunSummary] = useState<{ succeeded: number; failed: number } | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: presetsData, isLoading } = useQuery<PresetsData>({
    queryKey: ["/api/presets"],
    queryFn: async () => {
      const res = await fetch("/api/presets");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    return () => { eventSourceRef.current?.close(); };
  }, []);

  if (isLoading || !presetsData) return null;

  const { stage_plans, presets } = presetsData;
  const presetEntries = Object.entries(presets);
  const currentPreset = selectedPreset ? presets[selectedPreset] : null;

  const getPlanSteps = (plan: StagePlanEntry | string[]): string[] =>
    Array.isArray(plan) ? plan : plan.steps || [];
  const getPlanLabel = (id: string, plan: StagePlanEntry | string[]): string =>
    !Array.isArray(plan) && plan.label ? plan.label : id;

  const postSetupStagePlans = Object.entries(stage_plans).filter(
    ([id]) => !["system:import"].includes(id)
  );

  const effectiveStagePlan = selectedStagePlan
    || currentPreset?.recommended_stage_plan
    || null;

  const runPreset = () => {
    if (!selectedPreset || !effectiveStagePlan || isRunning || disabled) return;

    if (!projectName) {
      toast({ title: "No workspace selected", description: "Select or create a workspace first.", variant: "destructive" });
      return;
    }

    setIsRunning(true);
    setPresetOutput("");
    setRunSummary(null);
    setStepProgress([]);

    const body = JSON.stringify({
      projectName,
      presetId: selectedPreset,
      stagePlan: effectiveStagePlan,
    });

    const url = `/api/preset/run/stream?body=${encodeURIComponent(body)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("plan", (e) => {
      try {
        const data = JSON.parse(e.data);
        const steps = (data.steps as string[]).map((stepId: string, i: number) => ({
          index: i,
          stepId,
          label: stepId,
          status: "pending" as const,
        }));
        setStepProgress(steps);
      } catch {}
    });

    es.addEventListener("step-start", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStepProgress((prev) =>
          prev.map((s) =>
            s.index === data.index
              ? { ...s, label: data.label, status: "running" }
              : s
          )
        );
      } catch {}
    });

    es.addEventListener("stdout", (e) => {
      try {
        const data = JSON.parse(e.data);
        setPresetOutput((prev) => prev + data.text + "\n");
      } catch {}
    });

    es.addEventListener("stderr", (e) => {
      try {
        const data = JSON.parse(e.data);
        setPresetOutput((prev) => prev + "[stderr] " + data.text + "\n");
      } catch {}
    });

    es.addEventListener("step-done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStepProgress((prev) =>
          prev.map((s) =>
            s.index === data.index
              ? { ...s, label: data.label, status: data.status, durationMs: data.durationMs, reason: data.reason }
              : s
          )
        );
      } catch {}
    });

    es.addEventListener("done", (e) => {
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      try {
        const data = JSON.parse(e.data);
        setRunSummary({ succeeded: data.succeeded, failed: data.failed });
        if (data.failed === 0) {
          toast({ title: `Preset "${presets[selectedPreset].label}" completed`, description: `${data.succeeded} steps succeeded`, variant: "success" });
        } else {
          toast({ title: `Preset "${presets[selectedPreset].label}" had failures`, description: `${data.succeeded} succeeded, ${data.failed} failed`, variant: "destructive" });
        }
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules", projectName] });
    });

    es.addEventListener("error", () => {
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      toast({ title: "Preset run connection lost", variant: "destructive" });
    });
  };

  const cancelRun = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsRunning(false);
  };

  const presetCategories: { label: string; ids: string[] }[] = [
    { label: "Full System", ids: presetEntries.filter(([, p]) => p.modules.length > 10).map(([id]) => id) },
    { label: "Layers", ids: ["foundation", "core-spec", "security-layer", "ops", "quality-light", "quality-deep"] },
    { label: "App Targets", ids: ["web", "fullstack-web", "backend-api", "mobile", "desktop", "cross-platform-app"] },
    { label: "Focused", ids: presetEntries.filter(([id]) => id.endsWith("-only")).map(([id]) => id) },
    { label: "Other", ids: presetEntries.filter(([id]) => !["foundation", "core-spec", "security-layer", "ops", "quality-light", "quality-deep", "web", "fullstack-web", "backend-api", "mobile", "desktop", "cross-platform-app"].includes(id) && !id.endsWith("-only") && presets[id].modules.length <= 10).map(([id]) => id) },
  ].filter(c => c.ids.length > 0);

  return (
    <Card data-testid="card-presets-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Presets — Automated Workflows</CardTitle>
          <Badge variant="secondary" className="no-default-active-elevate ml-auto">
            {presetEntries.length} presets
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Select a preset and stage plan to run the full pipeline automatically. The system handles module orchestration, step ordering, and error recovery.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">1. Choose a Preset</div>
          {presetCategories.map((cat) => (
            <div key={cat.label} className="space-y-1.5">
              <div className="text-xs text-muted-foreground">{cat.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.ids.filter((id) => presets[id]).map((id) => (
                  <Button
                    key={id}
                    variant={selectedPreset === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedPreset(selectedPreset === id ? null : id);
                      setRunSummary(null);
                      setStepProgress([]);
                      setPresetOutput("");
                    }}
                    disabled={isRunning}
                    data-testid={`button-preset-${id}`}
                  >
                    {presets[id].label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {currentPreset && (
          <div className="rounded-md bg-muted p-3 space-y-2">
            <div className="text-sm font-medium">{currentPreset.label}</div>
            <div className="text-xs text-muted-foreground">{currentPreset.description}</div>
            <div className="flex flex-wrap gap-1">
              {currentPreset.modules.map((m) => (
                <Badge key={m} variant="secondary" className="no-default-active-elevate text-xs">
                  {m}
                </Badge>
              ))}
            </div>
            {currentPreset.include_dependencies && (
              <div className="text-xs text-muted-foreground">Includes dependency modules</div>
            )}
          </div>
        )}

        {selectedPreset && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">2. Choose a Stage Plan</div>
            <div className="flex flex-wrap gap-1.5">
              {postSetupStagePlans.map(([id, plan]) => (
                <Button
                  key={id}
                  variant={effectiveStagePlan === id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStagePlan(id)}
                  disabled={isRunning}
                  data-testid={`button-stage-plan-${id}`}
                >
                  <span>{getPlanLabel(id, plan)}</span>
                  <Badge variant="secondary" className="no-default-active-elevate ml-1">
                    {getPlanSteps(plan).length}
                  </Badge>
                </Button>
              ))}
            </div>
            {effectiveStagePlan && stage_plans[effectiveStagePlan] && (
              <div className="text-xs text-muted-foreground">
                Steps: {getPlanSteps(stage_plans[effectiveStagePlan]).join(" → ")}
              </div>
            )}
          </div>
        )}

        {selectedPreset && effectiveStagePlan && (
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                onClick={runPreset}
                disabled={disabled || !projectName}
                data-testid="button-run-preset"
              >
                <Play className="w-4 h-4" />
                Run {currentPreset?.label} — {effectiveStagePlan}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={cancelRun}
                data-testid="button-cancel-preset"
              >
                <Square className="w-4 h-4" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {stepProgress.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Progress</div>
            {stepProgress.map((step) => (
              <div
                key={step.index}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted"
                data-testid={`preset-step-${step.stepId}`}
              >
                {step.status === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
                {step.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />}
                {step.status === "error" && <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />}
                {step.status === "skipped" && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                {step.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                <span className="text-xs font-medium">{step.label}</span>
                {step.reason && <span className="text-xs text-muted-foreground">({step.reason})</span>}
                {step.durationMs != null && (
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {(step.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {runSummary && (
          <div className="flex items-center gap-2 text-sm" data-testid="text-preset-summary">
            {runSummary.failed === 0 ? (
              <Badge variant="success" className="no-default-active-elevate">
                All {runSummary.succeeded} steps passed
              </Badge>
            ) : (
              <>
                <Badge variant="success" className="no-default-active-elevate">{runSummary.succeeded} passed</Badge>
                <Badge variant="error" className="no-default-active-elevate">{runSummary.failed} failed</Badge>
              </>
            )}
          </div>
        )}

        {presetOutput && (
          <div>
            <div className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
              <Terminal className="w-3 h-3" /> Output
            </div>
            <ScrollArea className="max-h-64">
              <pre
                className="rounded-md p-3 text-xs font-mono whitespace-pre-wrap bg-background border"
                data-testid="text-preset-output"
              >
                {presetOutput}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineRunHistory({ projectName }: { projectName: string }) {
  const [expandedRun, setExpandedRun] = useState<number | null>(null);

  const { data: runs = [], isLoading } = useQuery<PipelineRun[]>({
    queryKey: ["/api/pipeline-runs", projectName],
    queryFn: async () => {
      const res = await fetch(`/api/pipeline-runs?projectName=${encodeURIComponent(projectName)}&limit=20`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground" data-testid="text-run-history-header">
        Run History ({runs.length} saved)
      </h3>
      {runs.map((run, i) => {
        const isSuccess = run.status === "success";
        const expanded = expandedRun === i;
        const createdAt = new Date(run.createdAt).toLocaleString();

        return (
          <Card key={run.id} data-testid={`db-run-${run.id}`}>
            <button
              onClick={() => setExpandedRun(expanded ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              data-testid={`db-run-${run.id}-toggle`}
            >
              {expanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              {isSuccess
                ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
              <span className="font-medium text-sm">{run.stepLabel}</span>
              <Badge variant="secondary" className="no-default-active-elevate shrink-0">{run.stepGroup}</Badge>
              <span className="text-xs text-muted-foreground ml-auto shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(run.durationMs / 1000).toFixed(1)}s
              </span>
              <Badge variant={isSuccess ? "success" : "error"} className="no-default-active-elevate shrink-0">
                exit {run.exitCode}
              </Badge>
            </button>
            {expanded && (
              <CardContent className="space-y-3 pt-0">
                <div className="text-xs text-muted-foreground">{createdAt}</div>
                {run.parsedJson ? (
                  <div className="rounded-md p-3 bg-muted text-xs">
                    <div className="font-semibold mb-1 text-muted-foreground">Parsed JSON</div>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(run.parsedJson as Record<string, unknown>, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {run.stdout && (
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
                      <Terminal className="w-3 h-3" /> stdout
                    </div>
                    <ScrollArea className="max-h-64">
                      <pre className="rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-background border">
                        {run.stdout || "(empty)"}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
                {run.stderr && (
                  <div>
                    <div className="text-xs font-medium mb-1 text-muted-foreground">stderr</div>
                    <ScrollArea className="max-h-40">
                      <pre className="rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-background border text-red-700 dark:text-red-400">
                        {run.stderr}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
