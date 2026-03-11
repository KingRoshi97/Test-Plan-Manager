import { Clock, FileText, Wrench, X, Archive } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { SessionStatusChip, UpgradeModeBadge, RevisionStatusChip, formatTimeAgo } from "./shared";
import type { UpgradeSessionSummary, UpgradeRevisionSummary } from "../../../../shared/upgrade-types";

interface CurrentUpgradeSessionCardProps {
  session: UpgradeSessionSummary;
  sourceRevision: UpgradeRevisionSummary | null;
  candidateRevision: UpgradeRevisionSummary | null;
  onOpenPlan: () => void;
  onOpenWorkspace: () => void;
  onCancelSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string) => void;
}

export function CurrentUpgradeSessionCard({
  session, sourceRevision, candidateRevision,
  onOpenPlan, onOpenWorkspace, onCancelSession, onArchiveSession,
}: CurrentUpgradeSessionCardProps) {
  const isTerminal = ["promoted", "failed", "cancelled", "archived"].includes(session.status);

  return (
    <GlassPanel solid>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Active Session</h3>
            <SessionStatusChip status={session.status} />
            <UpgradeModeBadge modeId={session.modeId} />
          </div>
          {!isTerminal && (
            <div className="flex gap-1">
              <button onClick={() => onCancelSession(session.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Cancel">
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
              <button onClick={() => onArchiveSession(session.id)} className="p-1.5 rounded hover:bg-zinc-500/10 transition-colors" title="Archive">
                <Archive className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-[hsl(var(--foreground))] mb-3">{session.objective}</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Source</div>
            <div className="text-xs text-[hsl(var(--foreground))]">
              {sourceRevision ? `Rev #${sourceRevision.revisionNumber}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Candidate</div>
            <div className="text-xs text-[hsl(var(--foreground))]">
              {candidateRevision ? `Rev #${candidateRevision.revisionNumber}` : "Not created"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Created</div>
            <div className="text-xs text-[hsl(var(--foreground))]">{formatTimeAgo(session.createdAt)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Updated</div>
            <div className="text-xs text-[hsl(var(--foreground))]">{formatTimeAgo(session.updatedAt)}</div>
          </div>
        </div>

        {session.blockingIssue && (
          <div className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 mb-3">
            {session.blockingIssue}
          </div>
        )}

        {!isTerminal && (
          <div className="flex gap-2">
            <button onClick={onOpenPlan} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs text-[hsl(var(--foreground))] transition-colors">
              <FileText className="w-3.5 h-3.5" /> Plan
            </button>
            <button onClick={onOpenWorkspace} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/10 text-xs text-cyan-400 transition-colors">
              <Wrench className="w-3.5 h-3.5" /> Workspace
            </button>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
