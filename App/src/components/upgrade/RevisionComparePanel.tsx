import { useState } from "react";
import { GitCompare, Loader2, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { DiffStatStrip, RevisionStatusChip } from "./shared";
import type { UpgradeRevisionSummary, RevisionDiffData, DiffItem, DiffRenameItem } from "../../../../shared/upgrade-types";

type DiffViewMode = "artifact" | "config" | "structural" | "semantic";

interface RevisionComparePanelProps {
  sourceRevision: UpgradeRevisionSummary | null;
  candidateRevision: UpgradeRevisionSummary | null;
  diff: RevisionDiffData | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerateDiff: () => void;
  onRefreshDiff: () => void;
}

function DiffSection({ title, items, color, icon }: { title: string; items: DiffItem[]; color: string; icon: string }) {
  const [expanded, setExpanded] = useState(true);
  if (items.length === 0) return null;

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-2 py-2">
        <span className={`text-xs font-semibold ${color}`}>{icon} {title}</span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{items.length}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" /> : <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" />}
      </button>
      {expanded && (
        <div className="space-y-1 ml-4">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-2 py-1 border-l-2 border-[hsl(var(--border))] pl-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[hsl(var(--foreground))]">{item.label}</div>
                {item.path && <div className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{item.path}</div>}
                {item.detail && <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.detail}</div>}
              </div>
              {item.category && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] flex-shrink-0">
                  {item.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RenameSection({ items }: { items: DiffRenameItem[] }) {
  const [expanded, setExpanded] = useState(true);
  if (items.length === 0) return null;

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-2 py-2">
        <span className="text-xs font-semibold text-blue-400">↗ Renamed</span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{items.length}</span>
        {expanded ? <ChevronUp className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" /> : <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))] ml-auto" />}
      </button>
      {expanded && (
        <div className="space-y-1 ml-4">
          {items.map(item => (
            <div key={item.id} className="py-1 border-l-2 border-blue-500/30 pl-3">
              <div className="text-[10px] font-mono text-red-400 line-through">{item.fromPath}</div>
              <div className="text-[10px] font-mono text-emerald-400">{item.toPath}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RevisionComparePanel({
  sourceRevision, candidateRevision, diff, isLoading, error,
  onGenerateDiff, onRefreshDiff,
}: RevisionComparePanelProps) {
  const [viewMode, setViewMode] = useState<DiffViewMode>("artifact");

  if (!sourceRevision || !candidateRevision) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-3">
          <GitCompare className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No revision comparison available yet</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">A candidate revision must exist before comparison.</div>
        </div>
      </GlassPanel>
    );
  }

  if (isLoading) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">Generating comparison...</div>
        </div>
      </GlassPanel>
    );
  }

  if (!diff) {
    return (
      <GlassPanel solid>
        <div className="p-8 text-center space-y-4">
          <GitCompare className="w-10 h-10 text-[hsl(var(--muted-foreground))]/40 mx-auto" />
          <div className="text-sm text-[hsl(var(--muted-foreground))]">No diff generated yet</div>
          <button
            onClick={onGenerateDiff}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <GitCompare className="w-4 h-4" /> Generate Diff
          </button>
        </div>
      </GlassPanel>
    );
  }

  const viewModes: { id: DiffViewMode; label: string }[] = [
    { id: "artifact", label: "Artifacts" },
    { id: "config", label: "Config" },
    { id: "structural", label: "Structural" },
    { id: "semantic", label: "Semantic" },
  ];

  return (
    <div className="space-y-3">
      <GlassPanel solid>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Revision Compare</h3>
            </div>
            <button onClick={onRefreshDiff} className="p-1.5 rounded hover:bg-[hsl(var(--muted))] transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Source</span>
              <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Rev #{sourceRevision.revisionNumber}</span>
              <RevisionStatusChip status={sourceRevision.status} />
            </div>
            <span className="text-[hsl(var(--muted-foreground))]">→</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Candidate</span>
              <span className="text-xs font-semibold text-cyan-400">Rev #{candidateRevision.revisionNumber}</span>
              <RevisionStatusChip status={candidateRevision.status} />
            </div>
          </div>

          <DiffStatStrip stats={diff.stats} />
        </div>
      </GlassPanel>

      <div className="flex gap-1 p-1 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))]">
        {viewModes.map(m => (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === m.id ? "bg-violet-600 text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <GlassPanel solid>
        <div className="p-4 space-y-3">
          {viewMode === "artifact" && (
            <>
              <DiffSection title="Added" items={diff.added} color="text-emerald-400" icon="+" />
              <DiffSection title="Removed" items={diff.removed} color="text-red-400" icon="−" />
              <DiffSection title="Modified" items={diff.modified} color="text-amber-400" icon="~" />
              <RenameSection items={diff.renamed} />
            </>
          )}
          {viewMode === "config" && (
            <DiffSection title="Config Changes" items={diff.configChanges || []} color="text-blue-400" icon="⚙" />
          )}
          {viewMode === "structural" && (
            <DiffSection title="Structural Changes" items={diff.structuralChanges || []} color="text-violet-400" icon="◆" />
          )}
          {viewMode === "semantic" && diff.semanticSummary && (
            <div className="space-y-3">
              {diff.semanticSummary.improvements.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-1">Improvements</div>
                  {diff.semanticSummary.improvements.map((s, i) => (
                    <div key={i} className="text-[11px] text-[hsl(var(--foreground))] py-0.5 pl-3 border-l-2 border-emerald-500/30">{s}</div>
                  ))}
                </div>
              )}
              {diff.semanticSummary.regressions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-1">Regressions</div>
                  {diff.semanticSummary.regressions.map((s, i) => (
                    <div key={i} className="text-[11px] text-[hsl(var(--foreground))] py-0.5 pl-3 border-l-2 border-red-500/30">{s}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          {viewMode === "semantic" && !diff.semanticSummary && (
            <div className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">No semantic analysis available</div>
          )}
        </div>
      </GlassPanel>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}
