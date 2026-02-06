import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { formatSize } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
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
} from "lucide-react";
import type { WorkspaceInfo, RunResult } from "@shared/schema";

interface StepDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  desc: string;
  extra?: Record<string, unknown>;
}

const steps: StepDef[] = [
  { id: "kit-create", label: "Kit Create", icon: <Plus className="w-4 h-4" />, endpoint: "/api/pipeline/kit-create", desc: "Initialize workspace" },
  { id: "generate", label: "Generate", icon: <Layers className="w-4 h-4" />, endpoint: "/api/pipeline/generate", desc: "Generate doc packs" },
  { id: "seed", label: "Seed", icon: <Package className="w-4 h-4" />, endpoint: "/api/pipeline/seed", desc: "Seed baseline docs" },
  { id: "scaffold-app", label: "Scaffold App", icon: <Hammer className="w-4 h-4" />, endpoint: "/api/pipeline/scaffold-app", desc: "App skeleton" },
  { id: "build-plan", label: "Build Plan", icon: <FileText className="w-4 h-4" />, endpoint: "/api/pipeline/build-plan", desc: "Task graph" },
  { id: "iterate", label: "Iterate (dry)", icon: <RotateCw className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Dry run" },
  { id: "iterate-apply", label: "Iterate (apply)", icon: <ArrowRight className="w-4 h-4" />, endpoint: "/api/pipeline/iterate", desc: "Apply changes", extra: { allowApply: true } },
];

export default function PipelinePage() {
  const [projectName, setProjectName] = useState("my-project");
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

    const body = { projectName, ...(step.extra || {}) };
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
        <p className="text-sm text-muted-foreground mt-1">Run AXION pipeline steps sequentially to build your project.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
          <CardTitle className="text-sm">Project</CardTitle>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="max-w-xs"
            data-testid="input-project-name"
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {steps.map((step) => (
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
            History ({outputs.length} runs)
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
