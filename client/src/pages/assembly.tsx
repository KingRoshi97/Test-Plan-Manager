import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { stepLabel } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Play,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
} from "lucide-react";

interface EnrichedAssembly {
  id: string;
  projectName: string | null;
  idea: string | null;
  preset: string | null;
  presetId: string | null;
  state: string;
  step: string | null;
  progress: unknown;
  errors: string[] | null;
  createdAt: string;
  updatedAt: string;
  wsExists: boolean;
  hasRegistry: boolean;
  hasDomains: boolean;
  hasApp: boolean;
  verifyStatus: string | null;
  lockEligible: boolean;
}

interface ModuleStatusData {
  projectName: string;
  modules: Record<string, Record<string, string>>;
  stages: string[];
  registryFiles: Record<string, boolean>;
}

interface StagePlanConfig {
  label: string;
  description: string;
  steps: string[];
}

interface PresetsData {
  stage_plans: Record<string, StagePlanConfig | string[]>;
  presets: Record<string, {
    label: string;
    description: string;
    modules: string[];
    include_dependencies?: boolean;
    recommended_stage_plan?: string;
    guards?: Record<string, boolean>;
  }>;
}

interface PipelineRunRecord {
  id: number;
  projectName: string;
  stepId: string;
  stepLabel: string;
  stepGroup: string;
  status: string;
  exitCode: number;
  durationMs: number;
  createdAt: string;
}

interface StepProgress {
  index: number;
  stepId: string;
  label: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  durationMs?: number;
  reason?: string;
}

function getStagePlanLabel(key: string, plan: StagePlanConfig | string[]): string {
  if (!Array.isArray(plan) && plan.label) return plan.label;
  return key;
}

function getStagePlanSteps(plan: StagePlanConfig | string[]): string[] {
  if (Array.isArray(plan)) return plan;
  return plan.steps || [];
}

function getStateBadgeVariant(state: string) {
  switch (state) {
    case "queued": return "secondary" as const;
    case "running": return "default" as const;
    case "completed": return "success" as const;
    case "failed": return "error" as const;
    case "exported": return "outline" as const;
    default: return "secondary" as const;
  }
}

function getStateBadgeClassName(state: string) {
  if (state === "running") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent";
  if (state === "exported") return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent";
  return "";
}

function getModuleStatusColor(status: string) {
  switch (status) {
    case "done": return "bg-green-500";
    case "partial": return "bg-yellow-500";
    case "error": return "bg-red-500";
    default: return "bg-gray-300 dark:bg-gray-600";
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = (ms / 1000).toFixed(1);
  return `${sec}s`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const STAGES = ["generate", "seed", "draft", "review", "verify", "lock"];
const STAGE_SHORT_LABELS: Record<string, string> = {
  generate: "Gen",
  seed: "Seed",
  draft: "Draft",
  review: "Rev",
  verify: "Ver",
  lock: "Lock",
};

export default function AssemblyPage() {
  const [, params] = useRoute("/assembly/:id");
  const assemblyId = params?.id;
  const [, navigate] = useLocation();

  const [selectedStagePlan, setSelectedStagePlan] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [streamOutput, setStreamOutput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const terminalRef = useRef<HTMLPreElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: assembly, isLoading: assemblyLoading } = useQuery<EnrichedAssembly>({
    queryKey: ["/api/assemblies", assemblyId],
    queryFn: async () => {
      const res = await fetch(`/api/assemblies/${assemblyId}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    enabled: !!assemblyId,
    refetchInterval: isRunning ? 5000 : false,
  });

  const { data: moduleStatus } = useQuery<ModuleStatusData>({
    queryKey: ["/api/status", assembly?.projectName],
    queryFn: async () => {
      const res = await fetch(`/api/status/${encodeURIComponent(assembly!.projectName!)}`);
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    enabled: !!assembly?.projectName,
  });

  const { data: presetsData } = useQuery<PresetsData>({
    queryKey: ["/api/presets"],
    queryFn: async () => {
      const res = await fetch("/api/presets");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: runHistory = [] } = useQuery<PipelineRunRecord[]>({
    queryKey: ["/api/pipeline-runs", assembly?.projectName],
    queryFn: async () => {
      const res = await fetch(`/api/pipeline-runs?projectName=${encodeURIComponent(assembly!.projectName!)}&limit=20`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!assembly?.projectName && showHistory,
  });

  const exportMutation = useMutation({
    mutationFn: () => apiRequest(`/api/assemblies/${assemblyId}/export`, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Export completed", description: "Kit has been exported successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamOutput]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const stagePlans = presetsData?.stage_plans
    ? Object.entries(presetsData.stage_plans)
    : [];

  const runPipeline = () => {
    if (!assemblyId || !selectedStagePlan || isRunning) return;

    setIsRunning(true);
    setStreamOutput("");
    setStepProgress([]);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/assemblies/${assemblyId}/run/stream?stagePlan=${encodeURIComponent(selectedStagePlan)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("plan", (e) => {
      try {
        const data = JSON.parse(e.data);
        const steps = (data.steps as string[]).map((stepId: string, i: number) => ({
          index: i,
          stepId,
          label: stepLabel(stepId),
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
              ? { ...s, label: data.label || stepLabel(s.stepId), status: "running" }
              : s
          )
        );
      } catch {}
    });

    es.addEventListener("stdout", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStreamOutput((prev) => prev + (data.text || e.data) + "\n");
      } catch {
        setStreamOutput((prev) => prev + e.data + "\n");
      }
    });

    es.addEventListener("stderr", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStreamOutput((prev) => prev + "[stderr] " + (data.text || e.data) + "\n");
      } catch {
        setStreamOutput((prev) => prev + "[stderr] " + e.data + "\n");
      }
    });

    es.addEventListener("step-done", (e) => {
      try {
        const data = JSON.parse(e.data);
        setStepProgress((prev) =>
          prev.map((s) =>
            s.index === data.index
              ? { ...s, label: data.label || stepLabel(s.stepId), status: data.status, durationMs: data.durationMs, reason: data.reason }
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
        if (data.failed === 0) {
          toast({ title: "Pipeline completed", description: `${data.succeeded} steps succeeded` });
        } else {
          toast({ title: "Pipeline had failures", description: `${data.succeeded} succeeded, ${data.failed} failed`, variant: "destructive" });
        }
      } catch {
        toast({ title: "Pipeline finished" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId] });
      queryClient.invalidateQueries({ queryKey: ["/api/status", assembly?.projectName] });
      queryClient.invalidateQueries({ queryKey: ["/api/pipeline-runs", assembly?.projectName] });
    });

    es.addEventListener("error", () => {
      es.close();
      eventSourceRef.current = null;
      setIsRunning(false);
      toast({ title: "Pipeline connection lost", variant: "destructive" });
    });
  };

  if (assemblyLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-testid="loading-assembly">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assembly) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" data-testid="assembly-not-found">
        <p className="text-muted-foreground">Assembly not found</p>
        <Button variant="outline" onClick={() => navigate("/")} data-testid="button-back-not-found">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const showExport = assembly.lockEligible || assembly.state === "completed";
  const modules = moduleStatus?.modules ? Object.entries(moduleStatus.modules) : [];

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="assembly-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-2 -ml-2"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          <h2 className="text-lg font-semibold truncate" data-testid="text-assembly-name">
            {assembly.projectName || "Untitled Assembly"}
          </h2>
          {assembly.idea && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-assembly-idea">
              {assembly.idea}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={getStateBadgeVariant(assembly.state)}
            className={`no-default-active-elevate ${getStateBadgeClassName(assembly.state)}`}
            data-testid="badge-assembly-state"
          >
            {assembly.state}
          </Badge>
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              data-testid="button-export-kit"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Kit
            </Button>
          )}
        </div>
      </div>

      <Card data-testid="card-pipeline-stepper">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={selectedStagePlan}
              onValueChange={setSelectedStagePlan}
              disabled={isRunning}
            >
              <SelectTrigger className="w-72" data-testid="select-stage-plan">
                <SelectValue placeholder="What do you want to run?" />
              </SelectTrigger>
              <SelectContent>
                {stagePlans.map(([id, plan]) => (
                  <SelectItem key={id} value={id} data-testid={`select-item-plan-${id}`}>
                    {getStagePlanLabel(id, plan)} ({getStagePlanSteps(plan).length} steps)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={runPipeline}
              disabled={!selectedStagePlan || isRunning}
              data-testid="button-run-pipeline"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? "Running..." : "Run Pipeline"}
            </Button>
          </div>

          {stepProgress.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-2" data-testid="pipeline-stepper">
              {stepProgress.map((step, i) => (
                <div key={step.index} className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-1" title={step.reason || undefined}>
                    {step.status === "pending" && (
                      <Circle className="w-5 h-5 text-gray-400" data-testid={`step-icon-pending-${i}`} />
                    )}
                    {step.status === "running" && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" data-testid={`step-icon-running-${i}`} />
                    )}
                    {step.status === "success" && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" data-testid={`step-icon-done-${i}`} />
                    )}
                    {step.status === "error" && (
                      <XCircle className="w-5 h-5 text-red-500" data-testid={`step-icon-failed-${i}`} />
                    )}
                    {step.status === "skipped" && (
                      <Circle className="w-5 h-5 text-yellow-400" data-testid={`step-icon-skipped-${i}`} />
                    )}
                    <span className="text-[10px] text-muted-foreground max-w-20 truncate text-center">
                      {step.label}
                    </span>
                    {step.durationMs != null && step.durationMs > 0 && step.status !== "pending" && step.status !== "running" && (
                      <span className="text-[9px] text-muted-foreground" data-testid={`step-duration-${i}`}>
                        {formatDuration(step.durationMs)}
                      </span>
                    )}
                    {step.reason && (step.status === "error" || step.status === "skipped") && (
                      <span className="text-[9px] text-red-500 dark:text-red-400 max-w-24 text-center leading-tight" data-testid={`step-reason-${i}`}>
                        {step.reason}
                      </span>
                    )}
                  </div>
                  {i < stepProgress.length - 1 && (
                    <div className="w-4 h-px bg-border shrink-0 mt-[-12px]" />
                  )}
                </div>
              ))}
            </div>
          )}

          {(streamOutput || isRunning) && (
            <div className="relative" data-testid="terminal-container">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Terminal className="w-3.5 h-3.5" />
                Live Output
              </div>
              <pre
                ref={terminalRef}
                className="rounded-md p-3 text-xs font-mono bg-gray-950 text-gray-200 dark:bg-gray-950 dark:text-gray-200 overflow-auto max-h-80 whitespace-pre-wrap"
                data-testid="terminal-output"
              >
                {streamOutput || "Waiting for output..."}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {modules.length > 0 && (
        <Card data-testid="card-module-grid">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Modules ({modules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {modules.map(([name, stageStatuses]) => (
                <div
                  key={name}
                  className="rounded-md border p-3 space-y-2"
                  data-testid={`module-card-${name}`}
                >
                  <span className="text-xs font-medium truncate block" data-testid={`module-name-${name}`}>
                    {name}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {STAGES.map((stage) => {
                      const status = stageStatuses[stage] || "pending";
                      return (
                        <div
                          key={stage}
                          className="flex items-center gap-0.5"
                          title={`${STAGE_SHORT_LABELS[stage] || stage}: ${status}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${getModuleStatusColor(status)}`}
                            data-testid={`module-status-${name}-${stage}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {STAGES.map((stage) => (
                      <span key={stage} className="text-[8px] text-muted-foreground" title={stepLabel(stage)}>
                        {STAGE_SHORT_LABELS[stage] || stage[0].toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div data-testid="section-run-history">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-3"
          data-testid="button-toggle-history"
        >
          {showHistory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Run History
        </button>

        {showHistory && (
          <Card>
            <CardContent className="pt-4">
              {runHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-history">
                  No run history yet.
                </p>
              ) : (
                <ScrollArea className="max-h-80">
                  <div className="space-y-1">
                    {runHistory.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded text-xs"
                        data-testid={`run-history-${run.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Badge
                            variant={run.status === "success" ? "success" : run.status === "error" ? "error" : "secondary"}
                            className="no-default-active-elevate text-[10px]"
                            data-testid={`run-status-${run.id}`}
                          >
                            {run.status}
                          </Badge>
                          <span className="truncate font-medium" data-testid={`run-step-${run.id}`}>
                            {run.stepLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                          <span data-testid={`run-duration-${run.id}`}>
                            {formatDuration(run.durationMs)}
                          </span>
                          <Clock className="w-3 h-3" />
                          <span data-testid={`run-time-${run.id}`}>
                            {formatRelativeTime(run.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
