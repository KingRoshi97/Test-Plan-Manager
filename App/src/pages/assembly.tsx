import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import {
  ChevronRight, Play, Trash2, ArrowLeft, CheckCircle, XCircle,
  Clock, Loader2, FileText, Folder, Download, Save, RotateCcw,
  Settings, Layers, Eye, FolderArchive, PenLine, Square, AlertTriangle, Hammer,
  Radio, Hash, Timer, Gauge, Activity, Zap
} from "lucide-react";
import { BuildTab } from "../components/build-mode";
import { StatusChip, getStatusVariant } from "../components/ui/status-chip";
import { GlassPanel } from "../components/ui/glass-panel";
import { MetricCard } from "../components/ui/metric-card";

const FALLBACK_STAGE_ORDER = [
  "S1_INGEST_NORMALIZE", "S2_VALIDATE_INTAKE", "S3_BUILD_CANONICAL",
  "S4_VALIDATE_CANONICAL", "S5_RESOLVE_STANDARDS", "S6_SELECT_TEMPLATES",
  "S7_RENDER_DOCS", "S8_BUILD_PLAN", "S9_VERIFY_PROOF", "S10_PACKAGE",
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

const SHORT_LABELS: Record<string, string> = {
  S1_INGEST_NORMALIZE: "S1",
  S2_VALIDATE_INTAKE: "S2",
  S3_BUILD_CANONICAL: "S3",
  S4_VALIDATE_CANONICAL: "S4",
  S5_RESOLVE_STANDARDS: "S5",
  S6_SELECT_TEMPLATES: "S6",
  S7_RENDER_DOCS: "S7",
  S8_BUILD_PLAN: "S8",
  S9_VERIFY_PROOF: "S9",
  S10_PACKAGE: "S10",
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

function formatMs(ms: number | null | undefined) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function formatDuration(start: string, end?: string | null) {
  if (!start) return "—";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = e - s;
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
  return `${(diff / 60000).toFixed(1)}m`;
}

function useElapsedTime(startedAt: string | null | undefined, isActive: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isActive && startedAt) {
      const start = new Date(startedAt).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [startedAt, isActive]);
  return elapsed;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function stageStatusInfo(status: string) {
  switch (status) {
    case "passed":
    case "completed":
      return { color: "var(--status-success)", glow: "green" as const, label: "Passed" };
    case "failed":
      return { color: "var(--status-failure)", glow: "red" as const, label: "Failed" };
    case "running":
      return { color: "var(--status-processing)", glow: "cyan" as const, label: "Running" };
    case "cancelled":
      return { color: "var(--status-warning)", glow: "amber" as const, label: "Cancelled" };
    default:
      return { color: "var(--muted-foreground)", glow: "none" as const, label: "Pending" };
  }
}

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "intake", label: "Intake", icon: PenLine },
  { id: "artifacts", label: "Artifacts", icon: FolderArchive },
  { id: "build", label: "Build", icon: Hammer },
  { id: "config", label: "Config", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

function WorkbenchPipelineStrip({ stages, stageOrder, stageGates, stageNames, selectedStage, onSelectStage }: {
  stages: Record<string, any> | null;
  stageOrder: string[];
  stageGates: Record<string, string>;
  stageNames: Record<string, string>;
  selectedStage: string | null;
  onSelectStage: (key: string) => void;
}) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto py-1 px-1">
      {stageOrder.map((stageKey, i) => {
        const stageData = stages?.[stageKey];
        const status = stageData?.status || "pending";
        const info = stageStatusInfo(status);
        const gate = stageGates[stageKey];
        const gateResult = stageData?.gateResult;
        const isSelected = selectedStage === stageKey;
        const shortLabel = SHORT_LABELS[stageKey] || `S${i + 1}`;

        return (
          <div key={stageKey} className="flex items-center">
            <button
              onClick={() => onSelectStage(stageKey)}
              className={`relative flex flex-col items-center px-2.5 py-1.5 rounded-md text-[11px] transition-all duration-200 min-w-[52px] ${
                isSelected
                  ? "bg-[hsl(var(--primary)/0.12)] border border-[hsl(var(--primary)/0.4)]"
                  : "border border-transparent hover:bg-[hsl(var(--accent))]"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full mb-1 ${status === "running" ? "animate-pulse-glow" : ""}`}
                style={{ backgroundColor: `hsl(${info.color})` }}
              />
              <span className={`font-mono-tech font-semibold ${isSelected ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {shortLabel}
              </span>
              {gate && gateResult && (
                <span className={`text-[8px] font-bold mt-0.5 ${
                  gateResult === "PASS" ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-failure))]"
                }`}>
                  {gateResult === "PASS" ? "✓" : "✗"}
                </span>
              )}
            </button>
            {i < stageOrder.length - 1 && (
              <div className={`w-3 h-[2px] ${
                status === "passed" || status === "completed"
                  ? "bg-[hsl(var(--status-success)/0.4)]"
                  : "bg-[hsl(var(--muted-foreground)/0.15)]"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OverviewTab({ assembly, latestStages, latestRun, onRun, onKill, isRunning, isKilling, stageOrder, stageNames }: {
  assembly: any; latestStages: any; latestRun: any; onRun: () => void; onKill: () => void;
  isRunning: boolean; isKilling: boolean; stageOrder: string[]; stageNames: Record<string, string>;
}) {
  const passedCount = stageOrder.filter((s) => latestStages?.[s]?.status === "passed").length;
  const failedCount = stageOrder.filter((s) => latestStages?.[s]?.status === "failed").length;
  const cancelledCount = stageOrder.filter((s) => latestStages?.[s]?.status === "cancelled").length;
  const pendingCount = stageOrder.length - passedCount - failedCount - cancelledCount;
  const pipelineRunning = assembly.status === "running";
  const elapsed = useElapsedTime(latestRun?.startedAt, pipelineRunning);

  const currentStageKey = pipelineRunning && latestStages
    ? stageOrder.find((s) => !latestStages[s] || latestStages[s].status === "pending")
    : null;
  const currentStageName = currentStageKey ? (stageNames[currentStageKey] || currentStageKey) : null;

  const failedStageKey = assembly.status === "failed" && latestStages
    ? stageOrder.find((s) => latestStages[s]?.status === "failed")
    : null;
  const failedStageName = failedStageKey ? (stageNames[failedStageKey] || failedStageKey) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {pipelineRunning && (
        <GlassPanel glow="cyan" solid className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[hsl(var(--status-processing))] animate-spin" />
              <div>
                <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Pipeline Running</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {currentStageName
                    ? `Stage ${passedCount + 1} of ${stageOrder.length} — ${currentStageName}`
                    : "Initializing..."}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-mono-tech font-bold text-[hsl(var(--status-processing))]">{formatElapsed(elapsed)}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">elapsed</div>
              </div>
              <button
                onClick={onKill}
                disabled={isKilling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-failure))] text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {isKilling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                Stop
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-[hsl(var(--muted))] rounded-full h-1.5">
              <div
                className="bg-[hsl(var(--status-processing))] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.max((passedCount / stageOrder.length) * 100, 2)}%` }}
              />
            </div>
          </div>
        </GlassPanel>
      )}

      {assembly.status === "failed" && !pipelineRunning && (
        <GlassPanel glow="red" solid className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-failure))] flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Pipeline Failed</div>
              <div className="text-xs text-[hsl(var(--status-failure))]">
                {assembly.error === "Pipeline killed by user" ? (
                  <span>Pipeline was stopped by user</span>
                ) : failedStageName ? (
                  <span>Failed at stage: {failedStageName}</span>
                ) : (
                  <span>{assembly.error || "An error occurred during pipeline execution"}</span>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {assembly.status === "completed" && (
        <GlassPanel glow="green" solid className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[hsl(var(--status-success))] flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Pipeline Completed</div>
              <div className="text-xs text-[hsl(var(--status-success))]">
                All {passedCount} stages passed in {formatMs(assembly.totalDurationMs)}
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Gauge} label="Status" value={assembly.status} accent={assembly.status === "completed" ? "green" : assembly.status === "failed" ? "red" : assembly.status === "running" ? "cyan" : "default"} />
        <MetricCard icon={CheckCircle} label="Passed" value={passedCount} accent="green" subtitle={`of ${stageOrder.length} stages`} />
        <MetricCard icon={XCircle} label="Failed" value={failedCount} accent={failedCount > 0 ? "red" : "default"} />
        <MetricCard icon={Timer} label="Duration" value={formatMs(assembly.totalDurationMs)} accent="default" subtitle={`${assembly.totalRuns ?? 0} runs`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel solid className="p-4">
          <h3 className="text-system-label mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: "Name", value: assembly.projectName },
              assembly.idea && { label: "Idea", value: assembly.idea },
              { label: "Preset", value: assembly.preset || "—", mono: true },
              { label: "Revision", value: assembly.revision ?? 0 },
              { label: "Created", value: formatDate(assembly.createdAt) },
              { label: "Updated", value: formatDate(assembly.updatedAt) },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} className="flex justify-between gap-4">
                <span className="text-[hsl(var(--muted-foreground))] text-xs">{row.label}</span>
                <span className={`text-[hsl(var(--foreground))] text-xs text-right ${row.mono ? "font-mono-tech" : ""}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel solid className="p-4">
          <h3 className="text-system-label mb-3">Pipeline Status</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-md py-2 text-center bg-[hsl(var(--status-success)/0.1)]">
              <div className="text-lg font-bold text-[hsl(var(--status-success))]">{passedCount}</div>
              <div className="text-[10px] text-[hsl(var(--status-success))]">Passed</div>
            </div>
            <div className="rounded-md py-2 text-center bg-[hsl(var(--status-failure)/0.1)]">
              <div className="text-lg font-bold text-[hsl(var(--status-failure))]">{failedCount}</div>
              <div className="text-[10px] text-[hsl(var(--status-failure))]">Failed</div>
            </div>
            <div className="rounded-md py-2 text-center bg-[hsl(var(--muted))]">
              <div className="text-lg font-bold text-[hsl(var(--muted-foreground))]">{pendingCount}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{cancelledCount > 0 ? "Remaining" : "Pending"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Verification:</span>
            {assembly.verificationStatus === "PASS" ? (
              <StatusChip variant="success" label="PASS" size="sm" />
            ) : assembly.verificationStatus === "FAIL" ? (
              <StatusChip variant="failure" label="FAIL" size="sm" />
            ) : (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
            )}
          </div>
        </GlassPanel>
      </div>

      {latestRun?.tokenUsage && latestRun.tokenUsage.total_tokens > 0 && (
        <GlassPanel solid className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[hsl(var(--status-warning))]" />
            <h3 className="text-system-label">Token Usage</h3>
            {assembly.status === "running" && (
              <StatusChip variant="processing" label="LIVE" pulse size="sm" />
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="rounded-md p-2 text-center bg-[hsl(var(--muted))]">
              <div className="text-lg font-bold text-[hsl(var(--foreground))]">{(latestRun.tokenUsage.total_tokens ?? 0).toLocaleString()}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Total Tokens</div>
            </div>
            <div className="rounded-md p-2 text-center bg-[hsl(var(--muted))]">
              <div className="text-lg font-bold text-[hsl(var(--status-processing))]">{(latestRun.tokenUsage.total_prompt_tokens ?? 0).toLocaleString()}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Input</div>
            </div>
            <div className="rounded-md p-2 text-center bg-[hsl(var(--muted))]">
              <div className="text-lg font-bold text-[hsl(var(--status-intelligence))]">{(latestRun.tokenUsage.total_completion_tokens ?? 0).toLocaleString()}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Output</div>
            </div>
            <div className="rounded-md p-2 text-center bg-[hsl(var(--muted))]">
              <div className="text-lg font-bold text-[hsl(var(--status-success))]">${(latestRun.tokenUsage.total_cost_usd ?? 0).toFixed(4)}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Cost</div>
            </div>
          </div>
          {latestRun.tokenUsage.by_stage && Object.keys(latestRun.tokenUsage.by_stage).length > 0 && (
            <div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">By Stage ({latestRun.tokenUsage.api_calls ?? 0} API calls)</div>
              <div className="space-y-1">
                {Object.entries(latestRun.tokenUsage.by_stage).map(([stage, data]: [string, any]) => (
                  <div key={stage} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[hsl(var(--muted)/0.5)]">
                    <span className="font-mono-tech text-[hsl(var(--muted-foreground))]">{stage}</span>
                    <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                      <span>{(data.total_tokens ?? 0).toLocaleString()} tok</span>
                      <span>${(data.cost_usd ?? 0).toFixed(4)}</span>
                      <span>{data.calls} call{data.calls !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>
      )}

      <div className="flex items-center gap-3">
        {assembly.status === "running" ? (
          <button
            onClick={onKill}
            disabled={isKilling}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--status-failure))] text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {isKilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
            Stop Pipeline
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Pipeline
          </button>
        )}
        {assembly.runId && assembly.status !== "running" && (
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

function PipelineTab({ stages, runs, assemblyId, stageOrder, stageGates, stageNames }: {
  stages: any; runs: any[]; assemblyId: string;
  stageOrder: string[]; stageGates: Record<string, string>; stageNames: Record<string, string>;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <GlassPanel solid className="p-4">
        <h3 className="text-system-label mb-4">Stage Timeline</h3>
        <div className="space-y-2">
          {stageOrder.map((stageKey) => {
            const stageData = stages?.[stageKey];
            const status = stageData?.status || "pending";
            const info = stageStatusInfo(status);
            const gate = stageGates[stageKey];
            const gateResult = stageData?.gateResult;

            return (
              <GlassPanel
                key={stageKey}
                solid
                glow={status === "passed" ? "green" : status === "failed" ? "red" : status === "running" ? "cyan" : "none"}
                className="p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md" style={{ backgroundColor: `hsl(${info.color} / 0.12)` }}>
                      {status === "passed" || status === "completed" ? (
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: `hsl(${info.color})` }} />
                      ) : status === "failed" ? (
                        <XCircle className="w-3.5 h-3.5" style={{ color: `hsl(${info.color})` }} />
                      ) : status === "running" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: `hsl(${info.color})` }} />
                      ) : (
                        <Clock className="w-3.5 h-3.5" style={{ color: `hsl(${info.color})` }} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {stageNames[stageKey] || stageKey}
                      </span>
                      <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))] ml-2">{stageKey}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gate && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        gateResult === "PASS"
                          ? "bg-[hsl(var(--status-success)/0.12)] text-[hsl(var(--status-success))]"
                          : gateResult === "FAIL"
                          ? "bg-[hsl(var(--status-failure)/0.12)] text-[hsl(var(--status-failure))]"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      }`}>
                        {gate}{gateResult ? ` · ${gateResult}` : ""}
                      </span>
                    )}
                    <StatusChip variant={getStatusVariant(status === "passed" ? "completed" : status)} label={info.label} size="sm" pulse={status === "running"} />
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </GlassPanel>

      <div>
        <h3 className="text-system-label mb-3">Run History</h3>
        <GlassPanel solid className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left px-4 py-2.5 text-system-label">Run ID</th>
                <th className="text-left px-4 py-2.5 text-system-label">Status</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Started</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Tokens</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Cost</th>
                <th className="text-left px-4 py-2.5 text-system-label hidden lg:table-cell">Stage</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-xs">
                    No pipeline runs yet
                  </td>
                </tr>
              )}
              {runs.map((run: any) => (
                <tr key={run.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                  <td className="px-4 py-2.5 font-mono-tech text-xs text-[hsl(var(--foreground))]">{run.runId}</td>
                  <td className="px-4 py-2.5">
                    <StatusChip variant={getStatusVariant(run.status)} label={run.status} size="sm" pulse={run.status === "running"} />
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-xs text-[hsl(var(--muted-foreground))]">{formatDate(run.startedAt)}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{formatDuration(run.startedAt, run.completedAt)}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{run.tokenUsage ? (run.tokenUsage.total_tokens ?? 0).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{run.tokenUsage ? `$${(run.tokenUsage.total_cost_usd ?? 0).toFixed(4)}` : "—"}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">{run.currentStage || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassPanel>
      </div>
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
          <button onClick={() => { setCurrentPath(runId); setSelectedFile(null); }} className="hover:text-[hsl(var(--primary))] transition-colors">
            {runId}
          </button>
          {pathParts.slice(1).map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <button
                onClick={() => { setCurrentPath(pathParts.slice(0, i + 2).join("/")); setSelectedFile(null); }}
                className="hover:text-[hsl(var(--primary))] transition-colors"
              >
                {part}
              </button>
            </span>
          ))}
        </div>
        <a
          href={`/api/assemblies/${assemblyId}/kit`}
          download
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
        >
          <Download className="w-3.5 h-3.5" />
          Download Kit
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel solid className="p-3 space-y-0.5 max-h-[500px] overflow-auto">
          {(entries as any[]).length === 0 && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] py-4 text-center">No files found</p>
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
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                selectedFile === entry.path
                  ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
              }`}
            >
              {entry.type === "directory" ? (
                <Folder className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--status-processing))]" />
              ) : (
                <FileText className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              )}
              <span className="truncate">{entry.name}</span>
            </button>
          ))}
        </GlassPanel>

        {selectedFile && fileContent && (
          <GlassPanel solid className="p-3 overflow-auto max-h-[500px]">
            <p className="text-[10px] font-mono-tech mb-2 text-[hsl(var(--muted-foreground))] pb-2 border-b border-[hsl(var(--border))]">{selectedFile}</p>
            <pre className="text-xs whitespace-pre-wrap font-mono-tech text-[hsl(var(--foreground))]">
              {typeof fileContent.content === "object"
                ? JSON.stringify(fileContent.content, null, 2)
                : fileContent.content}
            </pre>
          </GlassPanel>
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
      [activeSection]: { ...prev[activeSection], [key]: value },
    }));
    setHasChanges(true);
  }

  function renderFieldEditor(key: string, value: any) {
    const inputCls = "w-full px-3 py-1.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary)/0.5)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.2)] outline-none transition-colors";

    if (value === null || value === undefined) {
      return <input type="text" value="" onChange={(e) => handleFieldChange(key, e.target.value)} className={inputCls} placeholder="(empty)" />;
    }
    if (typeof value === "boolean") {
      return (
        <button
          onClick={() => handleFieldChange(key, !value)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            value
              ? "bg-[hsl(var(--status-success)/0.12)] text-[hsl(var(--status-success))]"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
          }`}
        >
          {value ? "true" : "false"}
        </button>
      );
    }
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object") {
        return (
          <pre className="text-xs font-mono-tech bg-[hsl(var(--muted))] rounded-md p-2 overflow-auto max-h-40 text-[hsl(var(--foreground))]">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      }
      return (
        <textarea
          value={value.join("\n")}
          onChange={(e) => handleFieldChange(key, e.target.value.split("\n").filter(Boolean))}
          className={`${inputCls} min-h-[60px] font-mono-tech`}
          rows={Math.max(2, Math.min(6, value.length))}
        />
      );
    }
    if (typeof value === "object") {
      return (
        <pre className="text-xs font-mono-tech bg-[hsl(var(--muted))] rounded-md p-2 overflow-auto max-h-40 text-[hsl(var(--foreground))]">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (typeof value === "string" && value.length > 80) {
      return <textarea value={value} onChange={(e) => handleFieldChange(key, e.target.value)} className={`${inputCls} min-h-[80px]`} rows={4} />;
    }
    return <input type="text" value={String(value)} onChange={(e) => handleFieldChange(key, e.target.value)} className={inputCls} />;
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <StatusChip variant="warning" label="Unsaved changes" size="sm" />
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
        <GlassPanel glow="red" solid className="p-3 text-sm text-[hsl(var(--status-failure))]">
          {((saveMutation.error || saveAndRunMutation.error) as Error)?.message || "An error occurred"}
        </GlassPanel>
      )}

      <div className="grid grid-cols-[180px_1fr] gap-4">
        <div className="space-y-0.5">
          {INTAKE_SECTIONS.map((section) => {
            const sectionData = editedPayload[section.key];
            const fieldCount = sectionData ? Object.keys(sectionData).length : 0;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all duration-150 flex items-center justify-between ${
                  activeSection === section.key
                    ? "nav-item-active font-medium"
                    : "text-[hsl(var(--muted-foreground))] nav-item-hover"
                }`}
              >
                <span>{section.label}</span>
                {fieldCount > 0 && (
                  <span className="text-[10px] opacity-50">{fieldCount}</span>
                )}
              </button>
            );
          })}
        </div>

        <GlassPanel solid className="p-4 space-y-3 overflow-auto max-h-[600px]">
          {currentSectionData && typeof currentSectionData === "object" ? (
            Object.entries(currentSectionData).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] font-mono-tech uppercase tracking-wider">{key}</label>
                {renderFieldEditor(key, value)}
              </div>
            ))
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))] py-4 text-center">No data for this section</p>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

function ConfigTab({ assembly, onDelete, isDeleting }: { assembly: any; onDelete: () => void; isDeleting: boolean }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <GlassPanel solid className="p-4">
        <h3 className="text-system-label mb-3">Assembly Configuration</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: "Assembly ID", value: assembly.id, mono: true },
            { label: "Preset", value: assembly.preset || "—", mono: true },
            { label: "Kit Type", value: assembly.kitType || "—", mono: true },
            { label: "Run ID", value: assembly.runId || "—", mono: true },
            { label: "Lock Ready", value: assembly.lockReady || "—" },
            { label: "Current Step", value: assembly.currentStep || "—", mono: true },
          ].map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{row.label}</span>
              <span className={`text-xs text-[hsl(var(--foreground))] ${row.mono ? "font-mono-tech" : ""}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {assembly.config && Object.keys(assembly.config).length > 0 && (
        <GlassPanel solid className="p-4">
          <h3 className="text-system-label mb-3">Config Object</h3>
          <pre className="text-xs font-mono-tech bg-[hsl(var(--background))] rounded-md p-3 overflow-auto max-h-64 text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
            {JSON.stringify(assembly.config, null, 2)}
          </pre>
        </GlassPanel>
      )}

      <GlassPanel glow="red" solid className="p-4">
        <h3 className="text-xs font-semibold text-[hsl(var(--status-failure))] mb-2 uppercase tracking-wider">Danger Zone</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          Permanently delete this assembly and all associated pipeline runs.
        </p>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[hsl(var(--status-failure))] text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Assembly
        </button>
      </GlassPanel>
    </div>
  );
}

export default function AssemblyPage() {
  const [, params] = useRoute("/assembly/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = params?.id;
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
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

  const killMutation = useMutation({
    mutationFn: () => apiRequest(`/api/assemblies/${id}/kill`, { method: "POST" }),
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
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (error || !assembly) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs hover:text-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
        </button>
        <GlassPanel solid className="p-12 text-center">
          <p className="text-[hsl(var(--status-failure))]">Assembly not found</p>
        </GlassPanel>
      </div>
    );
  }

  const runs = assembly.runs || [];
  const latestRun = runs.length > 0 ? runs[0] : null;
  const latestStages = latestRun?.stages || null;

  return (
    <div className="space-y-0">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs hover:text-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
      </button>

      <GlassPanel solid className="p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{assembly.projectName}</h1>
              <StatusChip
                variant={getStatusVariant(assembly.status)}
                label={assembly.status}
                pulse={assembly.status === "running"}
                size="md"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              {assembly.idea && <span className="max-w-md truncate">{assembly.idea}</span>}
              <span className="font-mono-tech bg-[hsl(var(--muted))] px-2 py-0.5 rounded">ID: {assembly.id}</span>
              {assembly.runId && <span className="font-mono-tech">{assembly.runId}</span>}
              <span>{formatMs(assembly.totalDurationMs)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {assembly.status === "running" ? (
              <button
                onClick={() => {
                  if (confirm("Stop this pipeline?")) killMutation.mutate();
                }}
                disabled={killMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--status-failure))] text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {killMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
                Stop
              </button>
            ) : (
              <button
                onClick={() => runMutation.mutate()}
                disabled={runMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
              >
                {runMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Pipeline
              </button>
            )}
            {assembly.runId && assembly.status !== "running" && (
              <a
                href={`/api/assemblies/${assembly.id}/kit`}
                download
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
              >
                <Download className="w-3.5 h-3.5" />
                Kit
              </a>
            )}
          </div>
        </div>

        <WorkbenchPipelineStrip
          stages={latestStages}
          stageOrder={stageOrder}
          stageGates={stageGates}
          stageNames={stageNames}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
        />
      </GlassPanel>

      {runMutation.isError && (
        <GlassPanel glow="red" solid className="p-3 mb-4 text-xs text-[hsl(var(--status-failure))]">
          {(runMutation.error as Error).message}
        </GlassPanel>
      )}

      <div className="border-b border-[hsl(var(--border))] mb-5">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                    : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--muted-foreground)/0.3)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
          latestRun={latestRun}
          onRun={() => runMutation.mutate()}
          onKill={() => {
            if (confirm("Stop this pipeline?")) killMutation.mutate();
          }}
          isRunning={runMutation.isPending}
          isKilling={killMutation.isPending}
          stageOrder={stageOrder}
          stageNames={stageNames}
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

      {activeTab === "intake" && <IntakeEditor assembly={assembly} assemblyId={Number(id)} />}

      {activeTab === "artifacts" && assembly.runId && <ArtifactBrowser runId={assembly.runId} assemblyId={assembly.id} />}
      {activeTab === "artifacts" && !assembly.runId && (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <FolderArchive className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No artifacts yet. Run the pipeline to generate output files.</p>
        </div>
      )}

      {activeTab === "build" && (
        <BuildTab assemblyId={Number(id)} runId={assembly.runId} pipelineStatus={assembly.status} />
      )}

      {activeTab === "config" && (
        <ConfigTab
          assembly={assembly}
          onDelete={() => {
            if (confirm("Delete this assembly?")) deleteMutation.mutate();
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
