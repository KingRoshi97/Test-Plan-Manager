import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Play, Download, Loader2, CheckCircle, XCircle, AlertTriangle,
  Package, FileCode, ChevronRight, RefreshCw, Clock, Zap, RotateCcw
} from "lucide-react";

interface BuildTabProps {
  assemblyId: number;
  runId: string | null;
  pipelineStatus: string;
  onRerunPipeline?: () => void;
  isRerunning?: boolean;
}

type BuildState = "not_requested" | "requested" | "approved" | "building" | "verifying" | "failed" | "passed" | "exported";

interface TokenUsageData {
  total_prompt_tokens?: number;
  total_completion_tokens?: number;
  total_tokens: number;
  total_cost_usd: number;
  api_calls: number;
  by_stage?: Record<string, { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_usd: number; calls: number }>;
}

interface BuildStatus {
  state: BuildState;
  buildId?: string;
  progress?: {
    currentSlice?: string;
    slicesCompleted: number;
    totalSlices: number;
    filesGenerated: number;
    totalFiles: number;
    tokenUsage?: TokenUsageData;
  };
  manifest?: any;
  verification?: any;
  repoManifest?: any;
  plan?: any;
  hasExportZip?: boolean;
  errors?: string[];
}

const STATE_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  not_requested: { label: "Not Started", color: "bg-gray-800 text-gray-300", icon: Clock },
  requested: { label: "Requested", color: "bg-blue-900/30 text-blue-300", icon: Loader2 },
  approved: { label: "Approved", color: "bg-blue-900/30 text-blue-300", icon: CheckCircle },
  building: { label: "Building", color: "bg-amber-900/30 text-amber-300", icon: Loader2 },
  verifying: { label: "Verifying", color: "bg-purple-900/30 text-purple-300", icon: Loader2 },
  failed: { label: "Failed", color: "bg-red-900/30 text-red-300", icon: XCircle },
  passed: { label: "Passed", color: "bg-green-900/30 text-green-300", icon: CheckCircle },
  exported: { label: "Exported", color: "bg-emerald-900/30 text-emerald-300", icon: Package },
};

function BuildStateBadge({ state }: { state: string }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.not_requested;
  const Icon = cfg.icon;
  const isAnimating = state === "building" || state === "verifying" || state === "requested";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className={`w-3.5 h-3.5 ${isAnimating ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>{label}</span>
          <span>{value}/{max} ({pct}%)</span>
        </div>
      )}
      <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
        <div
          className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TokenUsageCard({ tokenUsage, isLive }: { tokenUsage: TokenUsageData; isLive: boolean }) {
  return (
    <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Token Usage</h4>
        </div>
        {isLive && <LiveBadge />}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
          <p className="text-lg font-bold text-[hsl(var(--foreground))]">
            {tokenUsage.total_tokens.toLocaleString()}
          </p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Total Tokens</p>
        </div>
        {tokenUsage.total_prompt_tokens != null && (
          <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
            <p className="text-lg font-bold text-blue-600">
              {tokenUsage.total_prompt_tokens.toLocaleString()}
            </p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Input Tokens</p>
          </div>
        )}
        {tokenUsage.total_completion_tokens != null && (
          <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
            <p className="text-lg font-bold text-purple-600">
              {tokenUsage.total_completion_tokens.toLocaleString()}
            </p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Output Tokens</p>
          </div>
        )}
        <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
          <p className="text-lg font-bold text-emerald-600">
            ${tokenUsage.total_cost_usd.toFixed(4)}
          </p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Estimated Cost</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
        <span>API Calls: {tokenUsage.api_calls}</span>
        {tokenUsage.total_prompt_tokens != null && tokenUsage.total_completion_tokens != null && (
          <span>Ratio: {tokenUsage.total_tokens > 0 ? ((tokenUsage.total_completion_tokens / tokenUsage.total_tokens) * 100).toFixed(0) : 0}% output</span>
        )}
      </div>

      {tokenUsage.by_stage && Object.keys(tokenUsage.by_stage).length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Per-Stage Breakdown</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(tokenUsage.by_stage)
              .sort(([, a], [, b]) => (b.total_tokens ?? 0) - (a.total_tokens ?? 0))
              .map(([stage, data]) => (
              <div key={stage} className="flex items-center justify-between py-1 px-2 rounded text-xs bg-[hsl(var(--muted)/0.5)]">
                <span className="font-mono text-[hsl(var(--foreground))] truncate max-w-[200px]">{stage}</span>
                <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <span>{(data.total_tokens ?? 0).toLocaleString()} tok</span>
                  <span>${(data.cost_usd ?? 0).toFixed(4)}</span>
                  <span>{data.calls ?? 0} calls</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationResults({ verification }: { verification: any }) {
  if (!verification?.categories) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Verification Results</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {verification.categories.map((cat: any) => {
          const icon = cat.result === "pass" ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : cat.result === "fail" ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          );

          return (
            <div
              key={cat.categoryId}
              className="flex items-center gap-2 p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{cat.name}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {cat.checks?.length ?? 0} checks
                </p>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                cat.result === "pass" ? "bg-green-900/30 text-green-300" :
                cat.result === "fail" ? "bg-red-900/30 text-red-300" :
                "bg-amber-900/30 text-amber-300"
              }`}>
                {cat.result}
              </span>
            </div>
          );
        })}
      </div>
      {verification.summary && (
        <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))] mt-2">
          <span>Total: {verification.summary.totalChecks}</span>
          <span className="text-green-600">Passed: {verification.summary.passed}</span>
          <span className="text-red-600">Failed: {verification.summary.failed}</span>
          {verification.summary.warnings > 0 && (
            <span className="text-amber-600">Warnings: {verification.summary.warnings}</span>
          )}
        </div>
      )}
    </div>
  );
}

function FailureDisplay({ manifest }: { manifest: any }) {
  const failure = manifest?.failureEvidence;
  if (!failure) return null;
  return (
    <div className="p-4 rounded-lg border space-y-2" style={{ borderColor: "hsl(0 72% 55% / 0.3)", background: "hsl(0 72% 55% / 0.08)" }}>
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-red-300">Build Failed</span>
      </div>
      <div className="text-xs space-y-1 text-red-400">
        <p><span className="font-medium">Class:</span> {failure.failureClass}</p>
        <p><span className="font-medium">Phase:</span> {failure.phase}</p>
        <p><span className="font-medium">Reason:</span> {failure.reason}</p>
        {failure.blockedConditions?.length > 0 && (
          <div>
            <span className="font-medium">Blocked conditions:</span>
            <ul className="list-disc list-inside ml-2 mt-1">
              {failure.blockedConditions.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function BuildTab({ assemblyId, runId, pipelineStatus, onRerunPipeline, isRerunning }: BuildTabProps) {
  const queryClient = useQueryClient();
  const [selectedMode, setSelectedMode] = useState<"build_repo" | "build_and_export">("build_and_export");

  const canBuild = pipelineStatus === "completed" && !!runId;

  const { data: buildStatus, isLoading } = useQuery<BuildStatus>({
    queryKey: ["/api/assemblies", assemblyId, "build"],
    queryFn: () => apiRequest(`/api/assemblies/${assemblyId}/build`),
    enabled: canBuild,
    refetchInterval: (query) => {
      const d = query.state.data as BuildStatus | undefined;
      if (!d) return false;
      const active = ["requested", "approved", "building", "verifying"].includes(d.state);
      return active ? 2000 : false;
    },
  });

  const buildMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/assemblies/${assemblyId}/build`, {
        method: "POST",
        body: JSON.stringify({ mode: selectedMode }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "build"] });
    },
  });

  const state = buildStatus?.state ?? "not_requested";
  const isActive = ["requested", "approved", "building", "verifying"].includes(state);
  const isDone = ["passed", "exported"].includes(state);
  const isFailed = state === "failed";

  const liveTokenUsage = isActive ? buildStatus?.progress?.tokenUsage : null;
  const finalTokenUsage = buildStatus?.manifest?.tokenUsage;

  if (!canBuild) {
    return (
      <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
        <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">
          {!runId
            ? "No pipeline run yet. Complete a pipeline run to enable Build Mode."
            : "Pipeline must complete successfully before building."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Build Mode</h3>
          <BuildStateBadge state={state} />
        </div>
        {buildStatus?.buildId && (
          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{buildStatus.buildId}</span>
        )}
      </div>

      {state === "not_requested" && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Generate Project Repository</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Build Mode takes the approved Agent Kit and generates a complete, verified project repository. Choose a build mode below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMode("build_repo")}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedMode === "build_repo"
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileCode className="w-4 h-4" />
                <span className="text-sm font-medium">Build Repository</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Generate and verify the project repo. View results in the workspace.
              </p>
            </button>

            <button
              onClick={() => setSelectedMode("build_and_export")}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedMode === "build_and_export"
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Build & Export Zip</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Generate, verify, and package as a downloadable zip archive.
              </p>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => buildMutation.mutate()}
              disabled={buildMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {buildMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Build
            </button>

            {onRerunPipeline && (
              <button
                onClick={onRerunPipeline}
                disabled={isRerunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors"
              >
                {isRerunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Re-run Pipeline
              </button>
            )}
          </div>

          {onRerunPipeline && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Re-run Pipeline will re-execute the full pipeline to generate a fresh Agent Kit before building.
            </p>
          )}

          {buildMutation.isError && (
            <p className="text-xs text-red-500">
              Failed to start build: {(buildMutation.error as Error)?.message}
            </p>
          )}
        </div>
      )}

      {isActive && buildStatus?.progress && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">
              {state === "building" && buildStatus.progress.currentSlice
                ? `Building: ${buildStatus.progress.currentSlice}`
                : state === "verifying"
                ? "Running verification..."
                : "Processing..."}
            </span>
          </div>

          <ProgressBar
            value={buildStatus.progress.slicesCompleted}
            max={buildStatus.progress.totalSlices}
            label="Slices"
          />
          <ProgressBar
            value={buildStatus.progress.filesGenerated}
            max={buildStatus.progress.totalFiles}
            label="Files"
          />
        </div>
      )}

      {liveTokenUsage && (liveTokenUsage.api_calls > 0 || liveTokenUsage.total_tokens > 0) && (
        <TokenUsageCard tokenUsage={liveTokenUsage} isLive={true} />
      )}

      {isFailed && (
        <div className="space-y-4">
          <FailureDisplay manifest={buildStatus?.manifest} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => buildMutation.mutate()}
              disabled={buildMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Build
            </button>
            {onRerunPipeline && (
              <button
                onClick={onRerunPipeline}
                disabled={isRerunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-700/50 text-amber-300 text-sm font-medium hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
              >
                {isRerunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Re-run Pipeline
              </button>
            )}
          </div>
        </div>
      )}

      {isDone && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-green-400">
              Build {state === "exported" ? "Exported" : "Passed"}
            </span>
          </div>

          {buildStatus.repoManifest?.structure && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
                <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                  {buildStatus.repoManifest.structure.totalFiles}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Files Generated</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
                <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                  {buildStatus.repoManifest.structure.directories?.length ?? 0}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Directories</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[hsl(var(--muted))]">
                <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                  {(buildStatus.repoManifest.structure.totalSizeBytes / 1024).toFixed(1)}KB
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Total Size</p>
              </div>
            </div>
          )}

          {state === "exported" && buildStatus?.hasExportZip && (
            <a
              href={`/api/assemblies/${assemblyId}/build/download`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Download Project Zip
            </a>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {state === "passed" && (
              <button
                onClick={() => {
                  setSelectedMode("build_and_export");
                  buildMutation.mutate();
                }}
                disabled={buildMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <Package className="w-4 h-4" />
                Export as Zip
              </button>
            )}
            {onRerunPipeline && (
              <button
                onClick={onRerunPipeline}
                disabled={isRerunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-700/50 text-amber-300 text-sm font-medium hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
              >
                {isRerunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Re-run Pipeline
              </button>
            )}
          </div>
        </div>
      )}

      {finalTokenUsage && (isDone || isFailed) && (
        <TokenUsageCard tokenUsage={finalTokenUsage} isLive={false} />
      )}

      {buildStatus?.verification && (isDone || isFailed) && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <VerificationResults verification={buildStatus.verification} />
        </div>
      )}

      {buildStatus?.plan && isDone && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3">
          <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Build Slices</h4>
          <div className="space-y-1">
            {(buildStatus.plan.slices ?? []).map((slice: any) => (
              <div
                key={slice.sliceId}
                className="flex items-center justify-between py-1.5 px-2 rounded text-xs"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="font-medium">{slice.name}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {slice.files?.length ?? 0} files
                  </span>
                  {slice.requiresAI && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 text-[10px]">AI</span>
                  )}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  slice.status === "completed" ? "bg-green-900/30 text-green-300" :
                  slice.status === "failed" ? "bg-red-900/30 text-red-300" :
                  "bg-gray-800 text-gray-300"
                }`}>
                  {slice.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {buildStatus?.repoManifest?.fileInventory && isDone && (
        <details className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <summary className="p-4 cursor-pointer text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-xl transition-colors">
            File Inventory ({buildStatus.repoManifest.fileInventory.length} files)
          </summary>
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[hsl(var(--muted-foreground))]">
                  <th className="pb-2">Path</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2 text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {buildStatus.repoManifest.fileInventory.map((f: any, i: number) => (
                  <tr key={i} className="border-t border-[hsl(var(--border))]">
                    <td className="py-1 font-mono">{f.path}</td>
                    <td className="py-1">{f.role}</td>
                    <td className="py-1 text-right">{f.sizeBytes}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
