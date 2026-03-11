import { Loader2, Pause, RefreshCw, Save, Wrench, CheckCircle, XCircle, Clock } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { RevisionStatusChip, formatTimeAgo } from "./shared";
import type { UpgradeSessionSummary, UpgradeRevisionSummary, UpgradeExecutionStep, CandidateArtifactChange } from "../../../../shared/upgrade-types";

interface UpgradeWorkspacePanelProps {
  session: UpgradeSessionSummary;
  candidateRevision: UpgradeRevisionSummary | null;
  executionSteps: UpgradeExecutionStep[];
  changedArtifacts: CandidateArtifactChange[];
  isExecuting?: boolean;
  error?: string | null;
  onStartExecution: (sessionId: string) => void;
  onPauseExecution: (sessionId: string) => void;
  onRetryStep: (sessionId: string, stepId: string) => void;
  onSaveCandidate: (sessionId: string) => void;
}

const stepStatusIcon = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

const stepStatusColor = {
  pending: "text-zinc-400",
  running: "text-cyan-400",
  completed: "text-emerald-400",
  failed: "text-red-400",
  cancelled: "text-zinc-500",
};

export function UpgradeWorkspacePanel({
  session, candidateRevision, executionSteps, changedArtifacts,
  isExecuting, error,
  onStartExecution, onPauseExecution, onRetryStep, onSaveCandidate,
}: UpgradeWorkspacePanelProps) {
  const hasCandidate = !!candidateRevision;

  if (!hasCandidate && !isExecuting) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-4">
          <Wrench className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No candidate changes generated yet</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {session.status === "awaiting_approval"
              ? "Approve the plan first, then execution will create a candidate."
              : session.status === "executing"
                ? "Execution is in progress..."
                : "Generate and approve a plan to start execution."}
          </div>
          {(session.status === "executing" || session.status === "awaiting_approval") && (
            <button
              onClick={() => onStartExecution(session.id)}
              disabled={session.status === "awaiting_approval"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              <Wrench className="w-4 h-4" /> Execute Upgrade
            </button>
          )}
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-3">
      {candidateRevision && (
        <GlassPanel solid>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Candidate Revision</h3>
              <RevisionStatusChip status={candidateRevision.status} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Revision</div>
                <div className="text-xs text-[hsl(var(--foreground))]">#{candidateRevision.revisionNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Source</div>
                <div className="text-xs text-[hsl(var(--foreground))]">
                  {candidateRevision.parentRevisionId ? "Linked" : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Created</div>
                <div className="text-xs text-[hsl(var(--foreground))]">{formatTimeAgo(candidateRevision.createdAt)}</div>
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {executionSteps.length > 0 && (
        <GlassPanel solid>
          <div className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Execution Progress</h4>
            <div className="space-y-2">
              {executionSteps.map(step => {
                const StatusIcon = stepStatusIcon[step.status] || Clock;
                const color = stepStatusColor[step.status] || "text-zinc-400";
                return (
                  <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                    <StatusIcon className={`w-4 h-4 ${color} ${step.status === "running" ? "animate-spin" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[hsl(var(--foreground))]">{step.label}</div>
                      {step.message && <div className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{step.message}</div>}
                    </div>
                    {step.status === "failed" && (
                      <button onClick={() => onRetryStep(session.id, step.id)} className="p-1 rounded hover:bg-amber-500/10" title="Retry">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>
      )}

      {changedArtifacts.length > 0 && (
        <GlassPanel solid>
          <div className="p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">Changed Artifacts</h4>
            <div className="space-y-1">
              {changedArtifacts.map(artifact => (
                <div key={artifact.id} className="flex items-center gap-2 py-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    artifact.changeType === "added" ? "bg-emerald-500/20 text-emerald-400" :
                    artifact.changeType === "removed" ? "bg-red-500/20 text-red-400" :
                    artifact.changeType === "modified" ? "bg-amber-500/20 text-amber-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>{artifact.changeType}</span>
                  <span className="text-xs text-[hsl(var(--foreground))]">{artifact.label}</span>
                  {artifact.path && <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{artifact.path}</span>}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{error}</div>
      )}

      <div className="flex items-center gap-2 justify-end">
        {isExecuting && (
          <button onClick={() => onPauseExecution(session.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 text-xs text-amber-400 transition-colors">
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
        )}
        {hasCandidate && (
          <button onClick={() => onSaveCandidate(session.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors">
            <Save className="w-3.5 h-3.5" /> Save Candidate
          </button>
        )}
      </div>
    </div>
  );
}
