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
      { id: "lock", label: "Lock", icon: <Lock className="w-4 h-4" />, endpoint: "/api/pipeline/lock", desc: "Lock for build", needsModule: true },
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
      { id: "package", label: "Package", icon: <PackageOpen className="w-4 h-4" />, endpoint: "/api/pipeline/package", desc: "Bundle Agent Kit" },
      { id: "clean", label: "Clean", icon: <Trash2 className="w-4 h-4" />, endpoint: "/api/pipeline/clean", desc: "Clean artifacts" },
    ],
  },
];

export default function PipelinePage() {
  const [projectName, setProjectName] = useState("my-project");
  const [sourcePath, setSourcePath] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [outputs, setOutputs] = useState<RunResult[]>([]);
  const [expandedOutput, setExpandedOutput] = useState<number | null>(null);
  const [runningStep, setRunningStep] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: workspaces = [] } = useQuery<WorkspaceInfo[]>({
    queryKey: ["/api/workspaces"],
  });

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const runStep = async (step: StepDef) => {
    if (runningStep) return;
    setRunningStep(step.id);
    setStreamingOutput("");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const body: Record<string, unknown> = { projectName, ...(step.extra || {}) };
    if (step.needsSourcePath && sourcePath) {
      body.sourcePath = sourcePath;
    }
    if (step.needsModule && moduleFilter) {
      body.module = moduleFilter;
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
          const errSummary = result.stderr?.split("\n").filter(Boolean).slice(-2).join(" ") || "Unknown error";
          toast({
            title: `${step.label} failed (exit ${result.exitCode})`,
            description: errSummary.slice(0, 120),
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
    });

    es.addEventListener("error", () => {
      es.close();
      eventSourceRef.current = null;
      setRunningStep(null);
      setStreamingOutput("");
      toast({ title: `${step.label} connection lost`, variant: "destructive" });
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold" data-testid="text-pipeline-header">Pipeline</h2>
        <p className="text-sm text-muted-foreground mt-1">Run AXION pipeline steps to build your project.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
          <CardTitle className="text-sm">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-muted-foreground w-20 shrink-0">Project</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="max-w-xs"
              data-testid="input-project-name"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-muted-foreground w-20 shrink-0">Source Path</label>
            <Input
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="Path to existing repo (for Import)"
              className="max-w-md"
              data-testid="input-source-path"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-muted-foreground w-20 shrink-0">Module</label>
            <Input
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              placeholder="Leave empty for --all (e.g. architecture)"
              className="max-w-md"
              data-testid="input-module-filter"
            />
          </div>
        </CardContent>
      </Card>

      {stepGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{group.label}</CardTitle>
            <p className="text-xs text-muted-foreground">{group.desc}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {group.steps.map((step) => (
                <Button
                  key={step.id}
                  variant="secondary"
                  onClick={() => runStep(step)}
                  disabled={!!runningStep}
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
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

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

      {workspaces.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {workspaces.map((ws) => (
                <div
                  key={ws.projectName}
                  className="flex items-center gap-3 flex-wrap px-3 py-2 rounded-md bg-muted text-sm"
                  data-testid={`workspace-${ws.projectName}`}
                >
                  <FolderTree className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{ws.projectName}</span>
                  <div className="flex gap-1.5 ml-auto flex-wrap">
                    {ws.hasManifest && <Badge variant="success" className="no-default-active-elevate">manifest</Badge>}
                    {ws.hasRegistry && <Badge variant="success" className="no-default-active-elevate">registry</Badge>}
                    {ws.hasDomains && <Badge variant="success" className="no-default-active-elevate">domains</Badge>}
                    {ws.hasApp && <Badge variant="success" className="no-default-active-elevate">app</Badge>}
                  </div>
                </div>
              ))}
            </div>
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
