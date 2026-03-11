import type { UpgradeRevisionStatus, UpgradeSessionStatus, UpgradeVerificationVerdict, UpgradeModeId, UpgradeDiffStats } from "../../../../shared/upgrade-types";

const revisionStatusColors: Record<UpgradeRevisionStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  candidate: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  archived: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  rolled_back: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  superseded: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30",
};

const revisionStatusLabels: Record<UpgradeRevisionStatus, string> = {
  active: "Active", candidate: "Candidate", approved: "Approved",
  archived: "Archived", failed: "Failed", rolled_back: "Rolled Back",
  superseded: "Superseded",
};

export function RevisionStatusChip({ status }: { status: UpgradeRevisionStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${revisionStatusColors[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
      {revisionStatusLabels[status] || status}
    </span>
  );
}

const sessionStatusColors: Record<UpgradeSessionStatus, string> = {
  draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  awaiting_approval: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  executing: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  verifying: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  promotion_ready: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  promoted: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30",
  archived: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30",
};

const sessionStatusLabels: Record<UpgradeSessionStatus, string> = {
  draft: "Draft", planning: "Planning", awaiting_approval: "Awaiting Approval",
  approved: "Approved", executing: "Executing", verifying: "Verifying", promotion_ready: "Promotion Ready",
  promoted: "Promoted", failed: "Failed", cancelled: "Cancelled", archived: "Archived",
};

export function SessionStatusChip({ status }: { status: UpgradeSessionStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${sessionStatusColors[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
      {sessionStatusLabels[status] || status}
    </span>
  );
}

const modeLabels: Record<UpgradeModeId, string> = {
  "MM-05": "Planned Upgrade", "MM-06": "Hotfix", "MM-08": "Breaking Upgrade",
  "MM-09": "Artifact Migration", "MM-10": "Backcompat Validation",
  "MM-15": "Rollback / Revert", "MM-16": "Dependency Update",
  "MM-17": "Config Refresh", "MM-18": "Security Patch", "MM-19": "Performance Tune",
};

const modeColors: Record<string, string> = {
  "MM-05": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "MM-06": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "MM-08": "bg-red-500/20 text-red-400 border-red-500/30",
  "MM-09": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "MM-10": "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "MM-15": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "MM-16": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "MM-17": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "MM-18": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "MM-19": "bg-lime-500/20 text-lime-400 border-lime-500/30",
};

export function UpgradeModeBadge({ modeId }: { modeId: UpgradeModeId | string | null }) {
  if (!modeId) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${modeColors[modeId] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
      {modeLabels[modeId as UpgradeModeId] || modeId}
    </span>
  );
}

const verdictColors: Record<UpgradeVerificationVerdict, string> = {
  not_run: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pass_with_warnings: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  fail: "bg-red-500/20 text-red-400 border-red-500/30",
};

const verdictLabels: Record<UpgradeVerificationVerdict, string> = {
  not_run: "Not Run", running: "Running", pass: "Pass",
  pass_with_warnings: "Pass w/ Warnings", fail: "Fail",
};

const verdictIcons: Record<UpgradeVerificationVerdict, string> = {
  not_run: "○", running: "◉", pass: "✓", pass_with_warnings: "⚠", fail: "✕",
};

export function VerificationVerdictCard({ verdict, compact }: { verdict: UpgradeVerificationVerdict | null; compact?: boolean }) {
  const v = verdict || "not_run";
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${verdictColors[v]}`}>
        <span>{verdictIcons[v]}</span>
        {verdictLabels[v]}
      </span>
    );
  }
  return (
    <div className={`p-3 rounded-lg border ${verdictColors[v]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{verdictIcons[v]}</span>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider">Verification</div>
          <div className="text-sm font-semibold">{verdictLabels[v]}</div>
        </div>
      </div>
    </div>
  );
}

export function DiffStatStrip({ stats }: { stats: UpgradeDiffStats | null | undefined }) {
  if (!stats) return null;
  return (
    <div className="flex items-center gap-3 text-[11px]">
      {stats.added > 0 && <span className="text-emerald-400">+{stats.added} added</span>}
      {stats.removed > 0 && <span className="text-red-400">-{stats.removed} removed</span>}
      {stats.modified > 0 && <span className="text-amber-400">~{stats.modified} modified</span>}
      {stats.renamed > 0 && <span className="text-blue-400">↗{stats.renamed} renamed</span>}
      {(stats.warnings ?? 0) > 0 && <span className="text-orange-400">⚠{stats.warnings} warnings</span>}
    </div>
  );
}

export function RollbackTargetCard({ revisionNumber, status }: { revisionNumber: number | null; status: UpgradeRevisionStatus | null }) {
  if (!revisionNumber) return null;
  return (
    <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10">
      <div className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">Rollback Target</div>
      <div className="text-sm font-semibold text-amber-400">Rev #{revisionNumber}</div>
      {status && <RevisionStatusChip status={status} />}
    </div>
  );
}

export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return d.toLocaleDateString();
  if (diffMs < 60000) return "just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return d.toLocaleDateString();
}
