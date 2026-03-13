import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  Play, Download, Loader2, CheckCircle, XCircle, AlertTriangle,
  Package, FileCode, ChevronRight, RefreshCw, Clock, Zap,
  ShieldCheck, Eye, ArrowRight, ChevronDown, Wrench, History, Undo2,
  OctagonX
} from "lucide-react";

interface BuildableRun {
  runId: string;
  status: string;
  completedAt: string | null;
  startedAt: string;
  hasKit: boolean;
  hasBuild: boolean;
  buildStatus: string | null;
}

interface BuildTabProps {
  assemblyId: number;
  runId: string | null;
  pipelineStatus: string;
  buildableRuns?: BuildableRun[];
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
    phase?: string | null;
    phaseDetail?: string | null;
    slicesCompleted: number;
    totalSlices: number;
    filesGenerated: number;
    totalFiles: number;
    tokenUsage?: TokenUsageData;
    startedAt?: string;
    updatedAt?: string;
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

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    if (isNaN(start)) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (h > 0) {
        setElapsed(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
      } else if (m > 0) {
        setElapsed(`${m}m ${s.toString().padStart(2, "0")}s`);
      } else {
        setElapsed(`${s}s`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      <Clock className="w-3.5 h-3.5" />
      <span>{elapsed}</span>
    </div>
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

interface AVCSRun {
  id: string;
  assembly_id: number;
  run_id: string;
  run_type: string;
  status: string;
  domains_evaluated: string[];
  started_at?: string;
  completed_at?: string;
  verdict?: string;
  score?: number;
  created_at: string;
}

interface AVCSReport {
  verdict: string;
  overall_score: number;
  domains: Array<{
    domain: string;
    status: string;
    score: number;
    findings_count: number;
    checks: Array<{ check_id: string; description: string; result: string }>;
  }>;
  findings_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  remediation_manifest: {
    total_files: number;
    affected_unit_ids: string[];
    affected_findings: Array<{
      finding_id: string;
      title: string;
      severity: string;
      affected_files: string[];
    }>;
  };
  hard_stop_failures: string[];
}

const VERDICT_STYLES: Record<string, { bg: string; text: string; glow?: string }> = {
  PASS: { bg: "bg-green-900/30", text: "text-green-300", glow: "shadow-green-500/20" },
  PASS_WITH_WARNINGS: { bg: "bg-amber-900/30", text: "text-amber-300", glow: "shadow-amber-500/20" },
  CONDITIONAL_PASS: { bg: "bg-orange-900/30", text: "text-orange-300", glow: "shadow-orange-500/20" },
  FAIL: { bg: "bg-red-900/30", text: "text-red-300", glow: "shadow-red-500/20" },
  BLOCKED: { bg: "bg-gray-800", text: "text-gray-300" },
};

const DOMAIN_STATUS_STYLES: Record<string, string> = {
  pass: "bg-green-900/30 text-green-300",
  fail: "bg-red-900/30 text-red-300",
  warn: "bg-amber-900/30 text-amber-300",
  skip: "bg-gray-800 text-gray-300",
  blocked: "bg-gray-800 text-gray-300",
};

const RUN_TYPE_OPTIONS = [
  { value: "smoke", label: "Smoke", desc: "Quick integrity + functional checks" },
  { value: "functional", label: "Functional", desc: "Full functional verification" },
  { value: "security", label: "Security", desc: "Security scanning" },
  { value: "performance", label: "Performance", desc: "Performance analysis" },
  { value: "full_certification", label: "Full Certification", desc: "All 4 domains" },
];

function VerdictBadge({ verdict, large }: { verdict: string; large?: boolean }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.BLOCKED;
  const sizeClass = large
    ? `px-4 py-2 text-sm font-bold ${style.glow ? `shadow-lg ${style.glow}` : ""}`
    : "px-2.5 py-1 text-xs font-medium";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} ${sizeClass}`}>
      <ShieldCheck className={large ? "w-4 h-4" : "w-3 h-3"} />
      {verdict.replace(/_/g, " ")}
    </span>
  );
}

function AVCSSection({ assemblyId, runId }: { assemblyId: number; runId: string }) {
  const queryClient = useQueryClient();
  const [selectedRunType, setSelectedRunType] = useState("full_certification");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [remediationStatus, setRemediationStatus] = useState<"idle" | "running" | "complete" | "failed">("idle");
  const [remediationResult, setRemediationResult] = useState<{ filesFixed: number; filesFailed: number; filesUnchanged: number; errors: string[] } | null>(null);
  const remediationPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: avcsRuns = [], isLoading: runsLoading } = useQuery<AVCSRun[]>({
    queryKey: ["/api/avcs/runs", assemblyId],
    queryFn: () => apiRequest(`/api/avcs/runs?assemblyId=${assemblyId}`),
    refetchInterval: (query) => {
      const runs = query.state.data as AVCSRun[] | undefined;
      if (!runs) return false;
      const hasActive = runs.some(r => r.status === "planned" || r.status === "running");
      return hasActive ? 2000 : false;
    },
  });

  const latestRun = avcsRuns[0];
  const activeRunId = selectedRunId || latestRun?.id;

  const { data: report } = useQuery<AVCSReport>({
    queryKey: ["/api/avcs/runs", activeRunId, "report"],
    queryFn: () => apiRequest(`/api/avcs/runs/${activeRunId}/report`),
    enabled: !!activeRunId && avcsRuns.some(r => r.id === activeRunId && r.status === "completed"),
  });

  const createRunMutation = useMutation({
    mutationFn: async () => {
      const created = await apiRequest("/api/avcs/runs", {
        method: "POST",
        body: JSON.stringify({ assemblyId, runId, runType: selectedRunType }),
      });
      await apiRequest(`/api/avcs/runs/${created.id}/start`, { method: "POST" });
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/avcs/runs", assemblyId] });
    },
  });

  useEffect(() => {
    return () => {
      if (remediationPollRef.current) clearInterval(remediationPollRef.current);
    };
  }, []);

  const startRemediationPolling = (certRunId: string) => {
    if (remediationPollRef.current) clearInterval(remediationPollRef.current);
    let consecutiveErrors = 0;
    remediationPollRef.current = setInterval(async () => {
      try {
        const status = await apiRequest(`/api/avcs/runs/${certRunId}/remediation-status`);
        consecutiveErrors = 0;
        if (status.status === "complete") {
          if (remediationPollRef.current) clearInterval(remediationPollRef.current);
          remediationPollRef.current = null;
          setRemediationResult({
            filesFixed: status.filesFixed || 0,
            filesFailed: status.filesFailed || 0,
            filesUnchanged: status.filesUnchanged || 0,
            errors: status.errors || [],
          });
          setRemediationStatus("complete");
          queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "build"] });
        } else if (status.status === "failed") {
          if (remediationPollRef.current) clearInterval(remediationPollRef.current);
          remediationPollRef.current = null;
          setRemediationResult({
            filesFixed: status.filesFixed || 0,
            filesFailed: status.filesFailed || 0,
            filesUnchanged: status.filesUnchanged || 0,
            errors: status.errors || ["Remediation failed"],
          });
          setRemediationStatus("failed");
        }
      } catch {
        consecutiveErrors++;
        if (consecutiveErrors >= 10) {
          if (remediationPollRef.current) clearInterval(remediationPollRef.current);
          remediationPollRef.current = null;
          setRemediationResult({ filesFixed: 0, filesFailed: 0, filesUnchanged: 0, errors: ["Lost connection to remediation status"] });
          setRemediationStatus("failed");
        }
      }
    }, 3000);
  };

  const remediateMutation = useMutation({
    mutationFn: async (certRunId: string) => {
      setRemediationStatus("running");
      setRemediationResult(null);
      const res = await apiRequest(`/api/avcs/runs/${certRunId}/remediate`, { method: "POST" });
      startRemediationPolling(certRunId);
      return res;
    },
    onError: () => {
      setRemediationStatus("idle");
      if (remediationPollRef.current) clearInterval(remediationPollRef.current);
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (certRunId: string) => {
      return apiRequest(`/api/avcs/runs/${certRunId}/rollback`, { method: "POST" });
    },
    onSuccess: () => {
      setRemediationStatus("idle");
      setRemediationResult(null);
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "build"] });
    },
  });

  const activeRun = avcsRuns.find(r => r.id === activeRunId);
  const previousRuns = avcsRuns.filter(r => r.id !== activeRunId);
  const showRemediate = report && ["FAIL", "CONDITIONAL_PASS", "PASS_WITH_WARNINGS"].includes(report.verdict);

  if (runsLoading) {
    return (
      <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Certification</span>
          <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">AVCS Certification</span>
        </div>
        {activeRun?.verdict && <VerdictBadge verdict={activeRun.verdict} />}
      </div>

      {avcsRuns.length === 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            No certification history yet. Run AVCS to verify build quality, security, and performance.
          </p>
          <div className="flex flex-wrap gap-2">
            {RUN_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedRunType(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedRunType === opt.value
                    ? "border-blue-500 bg-blue-900/20 text-blue-300"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-blue-500/30"
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => createRunMutation.mutate()}
            disabled={createRunMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createRunMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Certify This Build
          </button>
          {createRunMutation.isError && (
            <p className="text-xs text-red-500">
              Failed to start certification: {(createRunMutation.error as Error)?.message}
            </p>
          )}
        </div>
      )}

      {activeRun && (activeRun.status === "planned" || activeRun.status === "running") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              Certification {activeRun.status === "planned" ? "starting" : "in progress"}...
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              ({activeRun.run_type.replace(/_/g, " ")})
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeRun.domains_evaluated.map(domain => {
              const domainLabel = domain.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              return (
                <div key={domain} className="flex items-center gap-2 p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">{domainLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeRun?.status === "completed" && report && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <VerdictBadge verdict={report.verdict} large />
            <div className="text-center px-3 py-1 rounded-lg bg-[hsl(var(--muted))]">
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">{report.overall_score}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {report.domains.map(d => {
              const domainLabel = d.domain.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              const statusStyle = DOMAIN_STATUS_STYLES[d.status] || DOMAIN_STATUS_STYLES.skip;
              return (
                <div key={d.domain} className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{domainLabel}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusStyle}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span>{d.score}/100</span>
                    <span>{d.findings_count} findings</span>
                  </div>
                </div>
              );
            })}
          </div>

          {report.findings_summary.total > 0 && (
            <div className="flex flex-wrap gap-2">
              {report.findings_summary.critical > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-900/40 text-red-300">
                  {report.findings_summary.critical} Critical
                </span>
              )}
              {report.findings_summary.high > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-900/40 text-orange-300">
                  {report.findings_summary.high} High
                </span>
              )}
              {report.findings_summary.medium > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-900/40 text-amber-300">
                  {report.findings_summary.medium} Medium
                </span>
              )}
              {report.findings_summary.low > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-900/40 text-blue-300">
                  {report.findings_summary.low} Low
                </span>
              )}
              {report.findings_summary.info > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-300">
                  {report.findings_summary.info} Info
                </span>
              )}
            </div>
          )}

          {report.hard_stop_failures.length > 0 && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-900/10 space-y-1">
              <span className="text-xs font-bold text-red-400">Hard-Stop Failures</span>
              {report.hard_stop_failures.map((f, i) => (
                <p key={i} className="text-xs text-red-300">{f}</p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={`/certification/${activeRun.id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Report
              <ArrowRight className="w-3 h-3" />
            </a>

            {showRemediate && remediationStatus === "idle" && (
              <button
                onClick={() => remediateMutation.mutate(activeRun.id)}
                disabled={remediateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20"
              >
                {remediateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                Remediate from Report
                <span className="text-xs opacity-80">
                  ({report.remediation_manifest.total_files} files, {report.remediation_manifest.affected_unit_ids.length} units, {report.remediation_manifest.affected_findings.length} findings)
                </span>
              </button>
            )}

            {remediationStatus === "running" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-900/20 border border-amber-500/30 text-amber-300 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Remediation in progress...</span>
              </div>
            )}

            {remediationStatus === "complete" && remediationResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/20 border border-green-500/30 text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Remediation complete — {remediationResult.filesFixed} fixed, {remediationResult.filesFailed} failed, {remediationResult.filesUnchanged} unchanged. Run certification again to verify.
                  </span>
                </div>
                {remediationResult.errors.length > 0 && (
                  <div className="text-xs text-amber-400 px-4">
                    {remediationResult.errors.slice(0, 3).map((e, i) => <div key={i}>⚠ {e}</div>)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRemediationStatus("idle");
                      setRemediationResult(null);
                      createRunMutation.mutate();
                    }}
                    disabled={createRunMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createRunMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Re-certify
                  </button>
                  <button
                    onClick={() => activeRun && rollbackMutation.mutate(activeRun.id)}
                    disabled={rollbackMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                  >
                    {rollbackMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Undo2 className="w-3.5 h-3.5" />
                    )}
                    Rollback
                  </button>
                </div>
              </div>
            )}

            {remediationStatus === "failed" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Remediation failed</span>
                </div>
                {remediationResult?.errors && remediationResult.errors.length > 0 && (
                  <div className="text-xs text-red-400 px-4">
                    {remediationResult.errors.slice(0, 3).map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}
                <button
                  onClick={() => setRemediationStatus("idle")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-[hsl(var(--border))]">
            <div className="flex flex-wrap gap-2">
              {RUN_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedRunType(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                    selectedRunType === opt.value
                      ? "border-blue-500 bg-blue-900/20 text-blue-300"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-blue-500/30"
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => createRunMutation.mutate()}
              disabled={createRunMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors"
            >
              {createRunMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              New Certification Run
            </button>
          </div>
        </div>
      )}

      {activeRun?.status === "failed" && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-900/10 space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Certification run failed</span>
          </div>
          <button
            onClick={() => createRunMutation.mutate()}
            disabled={createRunMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Certification
          </button>
        </div>
      )}

      {previousRuns.length > 0 && (
        <div className="pt-2 border-t border-[hsl(var(--border))]">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrevious ? "rotate-180" : ""}`} />
            Previous Runs ({previousRuns.length})
          </button>
          {showPrevious && (
            <div className="mt-2 space-y-1">
              {previousRuns.map(run => (
                <button
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    selectedRunId === run.id
                      ? "bg-[hsl(var(--muted))] border border-[hsl(var(--primary)/0.3)]"
                      : "hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[hsl(var(--muted-foreground))]">{run.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[10px]">
                      {run.run_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {run.verdict && <VerdictBadge verdict={run.verdict} />}
                    {run.score != null && (
                      <span className="text-[hsl(var(--muted-foreground))]">{run.score}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BuildTab({ assemblyId, runId, pipelineStatus, buildableRuns }: BuildTabProps) {
  const queryClient = useQueryClient();
  const [selectedMode, setSelectedMode] = useState<"build_repo" | "build_and_export">("build_and_export");

  const runs = buildableRuns ?? [];
  const defaultRunId = runs.length > 0 ? runs[0].runId : runId;
  const [selectedRunId, setSelectedRunId] = useState<string | null>(defaultRunId);

  useEffect(() => {
    if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0].runId);
    }
  }, [runs, selectedRunId]);

  const runsLoading = buildableRuns === undefined;
  const canBuild = runs.length > 0;
  const activeRunId = selectedRunId || runId;
  const selectedRun = runs.find(r => r.runId === activeRunId);

  const { data: buildStatus, isLoading } = useQuery<BuildStatus>({
    queryKey: ["/api/assemblies", assemblyId, "build", activeRunId],
    queryFn: () => apiRequest(`/api/assemblies/${assemblyId}/build${activeRunId ? `?runId=${activeRunId}` : ""}`),
    enabled: canBuild && !!activeRunId,
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
        body: JSON.stringify({ mode: selectedMode, runId: activeRunId }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "build", activeRunId] });
    },
  });

  const killMutation = useMutation({
    mutationFn: async () => {
      try {
        const buildRes = await apiRequest(`/api/assemblies/${assemblyId}/build/kill`, { method: "POST" });
        return buildRes;
      } catch {
        return apiRequest(`/api/assemblies/${assemblyId}/kill`, { method: "POST" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies", assemblyId, "build", activeRunId] });
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
    },
  });

  const rawState = buildStatus?.state ?? "not_requested";
  const state = rawState === "ready" ? "not_requested" : rawState;
  const isActive = ["requested", "approved", "building", "verifying"].includes(state);
  const isDone = ["passed", "exported"].includes(state);
  const isFailed = state === "failed";

  const liveTokenUsage = isActive ? buildStatus?.progress?.tokenUsage : null;
  const finalTokenUsage = buildStatus?.manifest?.tokenUsage;

  if (runsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (!canBuild) {
    return (
      <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
        <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">
          No completed pipeline history with kits available. Complete a pipeline execution to enable Build Mode.
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

      {runs.length > 1 && (
        <div className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Select Pipeline Run</span>
          </div>
          <div className="grid gap-2">
            {runs.map((run) => {
              const isSelected = run.runId === activeRunId;
              const date = run.completedAt ? new Date(run.completedAt) : new Date(run.startedAt);
              const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
              const buildLabel = run.buildStatus
                ? STATE_CONFIG[run.buildStatus]?.label || run.buildStatus
                : "No build";
              return (
                <button
                  key={run.runId}
                  onClick={() => setSelectedRunId(run.runId)}
                  disabled={isActive}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-left text-xs transition-all ${
                    isSelected
                      ? "border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                      : "border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] disabled:opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-[hsl(var(--foreground))]">{run.runId}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{dateStr}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    run.buildStatus === "passed" || run.buildStatus === "exported"
                      ? "bg-green-900/30 text-green-300"
                      : run.buildStatus === "failed"
                      ? "bg-red-900/30 text-red-300"
                      : "bg-gray-800 text-gray-400"
                  }`}>
                    {buildLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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

          {buildMutation.isError && (
            <p className="text-xs text-red-500">
              Failed to start build: {(buildMutation.error as Error)?.message}
            </p>
          )}
        </div>
      )}

      {isActive && buildStatus?.progress && (
        <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium">
                {state === "building" && buildStatus.progress.currentSlice
                  ? `Building: ${buildStatus.progress.currentSlice}`
                  : state === "verifying"
                  ? "Running verification..."
                  : buildStatus.progress.phaseDetail
                  ? buildStatus.progress.phaseDetail
                  : buildStatus.progress.phase === "baq_extraction"
                  ? "Running quality extraction..."
                  : buildStatus.progress.phase === "kit_extraction"
                  ? "Extracting build kit..."
                  : buildStatus.progress.phase === "blueprint"
                  ? "Deriving repo blueprint..."
                  : buildStatus.progress.phase === "planning"
                  ? "Planning build..."
                  : buildStatus.progress.phase === "gse"
                  ? "Computing generation strategy..."
                  : buildStatus.progress.phase === "generating"
                  ? "Generating files..."
                  : "Processing..."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(buildStatus.progress.startedAt || selectedRun?.startedAt) && (
                <ElapsedTimer startedAt={(buildStatus.progress.startedAt || selectedRun?.startedAt)!} />
              )}
              <button
                onClick={() => {
                  if (window.confirm("Kill this build? This will stop the pipeline and mark it as failed.")) {
                    killMutation.mutate();
                  }
                }}
                disabled={killMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50 transition-colors"
              >
                {killMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <OctagonX className="w-3.5 h-3.5" />
                )}
                Kill Build
              </button>
            </div>
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
          <button
            onClick={() => buildMutation.mutate()}
            disabled={buildMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Build
          </button>
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
              href={`/api/assemblies/${assemblyId}/build/download${activeRunId ? `?runId=${activeRunId}` : ""}`}
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
            <button
              onClick={() => buildMutation.mutate()}
              disabled={buildMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors"
            >
              {buildMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              New Build
            </button>
          </div>
        </div>
      )}

      {isDone && activeRunId && (
        <AVCSSection assemblyId={assemblyId} runId={activeRunId} />
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
