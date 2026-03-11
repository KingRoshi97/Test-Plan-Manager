import { useState } from "react";
import { ArrowUpCircle, RotateCcw, Loader2, AlertTriangle, Shield, Check, Archive, XCircle } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { RevisionStatusChip, VerificationVerdictCard, DiffStatStrip, formatTimeAgo } from "./shared";
import type {
  UpgradeRevisionSummary, UpgradeVerificationSummary, UpgradeDiffStats,
  UpgradeSessionSummary, UpgradeLineagePreview,
} from "../../../../shared/upgrade-types";

interface UpgradePromotionPanelProps {
  session: UpgradeSessionSummary;
  candidateRevision: UpgradeRevisionSummary | null;
  activeRevision: UpgradeRevisionSummary | null;
  verificationSummary: UpgradeVerificationSummary | null;
  diffStats: UpgradeDiffStats | null;
  lineagePreview: UpgradeLineagePreview | null;
  rollbackTarget: UpgradeRevisionSummary | null;
  isPromoting?: boolean;
  isRollingBack?: boolean;
  isKeeping?: boolean;
  isDiscarding?: boolean;
  error?: string | null;
  onPromote: (notes: string) => void;
  onRollback: (targetRevisionId: string, reason: string) => void;
  onKeepAsCandidate?: () => void;
  onDiscardCandidate?: (revisionId: string) => void;
}

export function UpgradePromotionPanel({
  session, candidateRevision, activeRevision,
  verificationSummary, diffStats, lineagePreview, rollbackTarget,
  isPromoting, isRollingBack, isKeeping, isDiscarding, error,
  onPromote, onRollback, onKeepAsCandidate, onDiscardCandidate,
}: UpgradePromotionPanelProps) {
  const [promotionNotes, setPromotionNotes] = useState("");
  const [rollbackReason, setRollbackReason] = useState("");
  const [confirmPromote, setConfirmPromote] = useState(false);
  const [confirmRollback, setConfirmRollback] = useState(false);

  const verificationPassed = verificationSummary?.verdict === "pass" || verificationSummary?.verdict === "pass_with_warnings";
  const canPromote = candidateRevision && verificationPassed && session.status === "promotion_ready";
  const canRollback = !!rollbackTarget;

  if (!candidateRevision) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-3">
          <ArrowUpCircle className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No candidate revision to promote</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Complete the upgrade workflow to reach this stage.</div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-4">
      <GlassPanel solid>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Promotion Decision</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Current Active</div>
              {activeRevision ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[hsl(var(--foreground))]">Rev #{activeRevision.revisionNumber}</div>
                  <RevisionStatusChip status={activeRevision.status} />
                </div>
              ) : (
                <div className="text-xs text-[hsl(var(--muted-foreground))]">No baseline</div>
              )}
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
              <div className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/70 mb-1">Candidate</div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-cyan-400">Rev #{candidateRevision.revisionNumber}</div>
                <RevisionStatusChip status={candidateRevision.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <VerificationVerdictCard verdict={verificationSummary?.verdict ?? null} />
            <div className="p-3 rounded-lg border border-[hsl(var(--border))]">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Change Summary</div>
              <DiffStatStrip stats={diffStats} />
            </div>
          </div>

          {lineagePreview && (
            <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5 mb-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-violet-400/70 mb-1">Lineage Preview</div>
              <div className="text-xs text-[hsl(var(--foreground))]">{lineagePreview.summary}</div>
            </div>
          )}
        </div>
      </GlassPanel>

      <GlassPanel solid>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Promote Candidate</h4>
          </div>

          {!canPromote && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-400">
                {!verificationPassed
                  ? "Verification must pass before promotion."
                  : session.status !== "promotion_ready"
                    ? `Session status is "${session.status}" — must be "promotion_ready".`
                    : "Promotion is not available at this time."}
              </div>
            </div>
          )}

          <textarea
            value={promotionNotes}
            onChange={(e) => setPromotionNotes(e.target.value)}
            rows={2}
            placeholder="Promotion notes (optional)..."
            className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-emerald-500/50 resize-none"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmPromote}
              onChange={(e) => setConfirmPromote(e.target.checked)}
              disabled={!canPromote}
              className="rounded border-[hsl(var(--border))]"
            />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              I confirm this candidate should become the new active revision
            </span>
          </label>

          <button
            onClick={() => onPromote(promotionNotes)}
            disabled={!canPromote || !confirmPromote || isPromoting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Promote to Active
          </button>
        </div>
      </GlassPanel>

      {canRollback && rollbackTarget && (
        <GlassPanel solid>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Rollback</h4>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70 mb-1">Rollback Target</div>
              <div className="text-sm font-semibold text-amber-400">Rev #{rollbackTarget.revisionNumber}</div>
              <RevisionStatusChip status={rollbackTarget.status} />
            </div>

            <textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              rows={2}
              placeholder="Reason for rollback..."
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:border-amber-500/50 resize-none"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmRollback}
                onChange={(e) => setConfirmRollback(e.target.checked)}
                className="rounded border-[hsl(var(--border))]"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                I confirm this rollback — the candidate will be discarded
              </span>
            </label>

            <button
              onClick={() => onRollback(rollbackTarget.id, rollbackReason)}
              disabled={!confirmRollback || isRollingBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isRollingBack ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Execute Rollback
            </button>
          </div>
        </GlassPanel>
      )}

      {candidateRevision && (onKeepAsCandidate || onDiscardCandidate) && (
        <GlassPanel solid>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">Other Actions</h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {onKeepAsCandidate && (
                <button
                  onClick={onKeepAsCandidate}
                  disabled={isKeeping}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-40 disabled:cursor-not-allowed text-sm text-[hsl(var(--muted-foreground))] transition-colors"
                >
                  {isKeeping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                  Keep as Candidate
                </button>
              )}

              {onDiscardCandidate && (
                <button
                  onClick={() => onDiscardCandidate(candidateRevision.id)}
                  disabled={isDiscarding}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-red-400 transition-colors"
                >
                  {isDiscarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Discard Candidate
                </button>
              )}
            </div>
          </div>
        </GlassPanel>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}
