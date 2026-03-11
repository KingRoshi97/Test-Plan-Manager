import { useState } from "react";
import { Eye, GitCompare, ArrowUpCircle, Play, RotateCcw, Archive, MoreVertical } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { RevisionStatusChip, UpgradeModeBadge, formatTimeAgo } from "./shared";
import type { UpgradeRevisionSummary } from "../../../../shared/upgrade-types";

interface RevisionTimelineProps {
  revisions: UpgradeRevisionSummary[];
  activeRevisionId?: string | null;
  candidateRevisionId?: string | null;
  selectedRevisionId?: string | null;
  onSelectRevision: (revisionId: string) => void;
  onCompareToActive: (revisionId: string) => void;
  onStartUpgradeFromRevision: (revisionId: string) => void;
  onPromoteRevision: (revisionId: string) => void;
  onRollbackRevision: (revisionId: string) => void;
  onArchiveRevision: (revisionId: string) => void;
}

export function RevisionTimeline({
  revisions, activeRevisionId, candidateRevisionId, selectedRevisionId,
  onSelectRevision, onCompareToActive, onStartUpgradeFromRevision,
  onPromoteRevision, onRollbackRevision, onArchiveRevision,
}: RevisionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (revisions.length === 0) {
    return (
      <GlassPanel solid>
        <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No revisions yet
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel solid>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GitCompare className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Revision Timeline</h3>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{revisions.length} revision{revisions.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {revisions.map((rev, idx) => {
            const isActive = rev.id === activeRevisionId;
            const isCandidate = rev.id === candidateRevisionId;
            const isSelected = rev.id === selectedRevisionId;
            const isExpanded = expandedId === rev.id;

            return (
              <div key={rev.id} className="flex items-start gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    onSelectRevision(rev.id);
                    setExpandedId(isExpanded ? null : rev.id);
                  }}
                  className={`relative p-3 rounded-lg border transition-all min-w-[140px] text-left ${
                    isSelected
                      ? "border-violet-500/50 bg-violet-500/10"
                      : isActive
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : isCandidate
                          ? "border-cyan-500/30 bg-cyan-500/5"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--border))]/80 hover:bg-[hsl(var(--muted))]/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[hsl(var(--foreground))]">#{rev.revisionNumber}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {isCandidate && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    {rev.isRollbackTarget && <RotateCcw className="w-3 h-3 text-amber-400" />}
                  </div>
                  <RevisionStatusChip status={rev.status} />
                  {rev.modeId && <div className="mt-1"><UpgradeModeBadge modeId={rev.modeId} /></div>}
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{formatTimeAgo(rev.createdAt)}</div>
                  {rev.title && <div className="text-[10px] text-[hsl(var(--muted-foreground))] truncate mt-0.5 max-w-[120px]">{rev.title}</div>}
                </button>

                {isExpanded && (
                  <div className="flex flex-col gap-1 py-2">
                    <button onClick={() => onCompareToActive(rev.id)} className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors" title="Compare to Active">
                      <Eye className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                    </button>
                    {!isActive && (
                      <button onClick={() => onStartUpgradeFromRevision(rev.id)} className="p-1.5 rounded hover:bg-violet-500/10 transition-colors" title="Upgrade From Here">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-violet-400" />
                      </button>
                    )}
                    {!isActive && rev.status === "candidate" && (
                      <button onClick={() => onPromoteRevision(rev.id)} className="p-1.5 rounded hover:bg-emerald-500/10 transition-colors" title="Promote">
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )}
                    {rev.isRollbackTarget && !isActive && (
                      <button onClick={() => onRollbackRevision(rev.id)} className="p-1.5 rounded hover:bg-amber-500/10 transition-colors" title="Rollback">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                    {!isActive && (
                      <button onClick={() => onArchiveRevision(rev.id)} className="p-1.5 rounded hover:bg-zinc-500/10 transition-colors" title="Archive">
                        <Archive className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    )}
                  </div>
                )}

                {idx < revisions.length - 1 && (
                  <div className="flex items-center self-center">
                    <div className="w-4 h-px bg-[hsl(var(--border))]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
