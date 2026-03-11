import { Eye, Play, Shield, RotateCcw } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { RevisionStatusChip, UpgradeModeBadge, VerificationVerdictCard, SessionStatusChip, formatTimeAgo } from "./shared";
import type { UpgradeRevisionSummary, UpgradeSessionSummary, UpgradeVerificationSummary } from "../../../../shared/upgrade-types";

interface UpgradeHeaderRailProps {
  activeRevision: UpgradeRevisionSummary | null;
  sourceRevision: UpgradeRevisionSummary | null;
  candidateRevision: UpgradeRevisionSummary | null;
  activeSession: UpgradeSessionSummary | null;
  verificationSummary: UpgradeVerificationSummary | null;
  rollbackTarget: UpgradeRevisionSummary | null;
  lastPromotedAt?: string | null;
  onViewDiff?: () => void;
  onRunVerification?: () => void;
  onPromote?: () => void;
  onRollback?: () => void;
}

export function UpgradeHeaderRail({
  activeRevision, sourceRevision, candidateRevision,
  activeSession, verificationSummary, rollbackTarget,
  lastPromotedAt,
  onViewDiff, onRunVerification, onPromote, onRollback,
}: UpgradeHeaderRailProps) {
  const hasCandidate = !!candidateRevision;
  const borderColor = hasCandidate
    ? activeSession?.status === "promotion_ready" ? "border-emerald-500/30" : "border-cyan-500/30"
    : "border-[hsl(var(--border))]";

  return (
    <GlassPanel solid>
      <div className={`p-4 border-l-2 ${borderColor}`}>
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Active Revision</div>
                {activeRevision ? (
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Rev #{activeRevision.revisionNumber}</div>
                    <RevisionStatusChip status={activeRevision.status} />
                  </div>
                ) : (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">No baseline</div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Candidate</div>
                {candidateRevision ? (
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-cyan-400">Rev #{candidateRevision.revisionNumber}</div>
                    <RevisionStatusChip status={candidateRevision.status} />
                  </div>
                ) : (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">None</div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Session</div>
                {activeSession ? (
                  <div className="space-y-1">
                    <UpgradeModeBadge modeId={activeSession.modeId} />
                    <SessionStatusChip status={activeSession.status} />
                  </div>
                ) : (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">No active session</div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Verification</div>
                <VerificationVerdictCard verdict={verificationSummary?.verdict ?? null} compact />
                {lastPromotedAt && (
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                    Last promoted {formatTimeAgo(lastPromotedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasCandidate && onViewDiff && (
              <button onClick={onViewDiff} className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title="View Diff">
                <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </button>
            )}
            {hasCandidate && onRunVerification && (
              <button onClick={onRunVerification} className="p-2 rounded-lg border border-violet-500/30 hover:bg-violet-500/10 transition-colors" title="Run Verification">
                <Shield className="w-4 h-4 text-violet-400" />
              </button>
            )}
            {hasCandidate && onPromote && activeSession?.status === "promotion_ready" && (
              <button onClick={onPromote} className="p-2 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors" title="Promote">
                <Play className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            {rollbackTarget && onRollback && (
              <button onClick={onRollback} className="p-2 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 transition-colors" title="Rollback">
                <RotateCcw className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
