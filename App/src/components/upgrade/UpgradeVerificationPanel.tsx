import { useState } from "react";
import { Shield, Loader2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, Clock, Minus } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { VerificationVerdictCard, formatTimeAgo } from "./shared";
import type { RevisionVerificationDetail, VerificationCheckData, VerificationCheckStatus } from "../../../../shared/upgrade-types";

interface UpgradeVerificationPanelProps {
  verification: RevisionVerificationDetail | null;
  isRunning?: boolean;
  error?: string | null;
  onRunVerification: () => void;
  onRefreshVerification: () => void;
}

const checkStatusIcon: Record<VerificationCheckStatus, typeof CheckCircle> = {
  not_run: Minus,
  running: Loader2,
  pass: CheckCircle,
  warning: AlertTriangle,
  fail: XCircle,
};

const checkStatusColor: Record<VerificationCheckStatus, string> = {
  not_run: "text-zinc-400",
  running: "text-blue-400",
  pass: "text-emerald-400",
  warning: "text-amber-400",
  fail: "text-red-400",
};

function CheckGroup({ title, checks }: { title: string; checks: VerificationCheckData[] }) {
  const [expanded, setExpanded] = useState(true);
  if (checks.length === 0) return null;

  const passCount = checks.filter(c => c.status === "pass").length;

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-2 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{title}</span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{passCount}/{checks.length} passed</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" /> : <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" />}
      </button>
      {expanded && (
        <div className="space-y-1">
          {checks.map(check => {
            const Icon = checkStatusIcon[check.status];
            const color = checkStatusColor[check.status];
            return (
              <div key={check.id} className="flex items-start gap-2 p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color} ${check.status === "running" ? "animate-spin" : ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[hsl(var(--foreground))]">{check.label}</div>
                  {check.message && <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{check.message}</div>}
                  {check.proofRefs && check.proofRefs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {check.proofRefs.map((ref, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{ref}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                  check.category === "required" ? "bg-violet-500/20 text-violet-400" :
                  check.category === "compatibility" ? "bg-amber-500/20 text-amber-400" :
                  "bg-zinc-500/20 text-zinc-400"
                }`}>{check.category}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function UpgradeVerificationPanel({
  verification, isRunning, error,
  onRunVerification, onRefreshVerification,
}: UpgradeVerificationPanelProps) {
  if (isRunning) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Running verification checks...</div>
        </div>
      </GlassPanel>
    );
  }

  if (!verification) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-4">
          <Shield className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No verification run yet</div>
          <button
            onClick={onRunVerification}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Shield className="w-4 h-4" /> Run Verification
          </button>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-3">
      <GlassPanel solid>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Verification Results</h3>
            </div>
            <div className="flex items-center gap-2">
              {verification.lastRunAt && (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {formatTimeAgo(verification.lastRunAt)}
                </span>
              )}
              <button onClick={onRefreshVerification} className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>
          </div>

          <VerificationVerdictCard verdict={verification.verdict} />
        </div>
      </GlassPanel>

      <GlassPanel solid>
        <div className="p-4 space-y-4">
          <CheckGroup title="Required Checks" checks={verification.requiredChecks} />
          <CheckGroup title="Optional Checks" checks={verification.optionalChecks} />
          {verification.compatibilityChecks && verification.compatibilityChecks.length > 0 && (
            <CheckGroup title="Compatibility Checks" checks={verification.compatibilityChecks} />
          )}
          {verification.ciChecks && verification.ciChecks.length > 0 && (
            <CheckGroup title="CI Checks" checks={verification.ciChecks} />
          )}
          {verification.workspaceChecks && verification.workspaceChecks.length > 0 && (
            <CheckGroup title="Workspace Checks" checks={verification.workspaceChecks} />
          )}
        </div>
      </GlassPanel>

      {verification.warnings.length > 0 && (
        <GlassPanel solid>
          <div className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">Warnings</h4>
            <div className="space-y-1">
              {verification.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-amber-400">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onRunVerification}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-run Verification
        </button>
      </div>
    </div>
  );
}
