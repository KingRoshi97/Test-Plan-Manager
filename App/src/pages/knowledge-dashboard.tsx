import { useState } from "react";
import { useLocation } from "wouter";
import {
  Library,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Zap,
  Shield,
  Layers,
  ArrowUpRight,
  BarChart3,
  Clock,
  Check,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip } from "../components/ui/status-chip";
import {
  libraries,
  phases,
  fastestLiftOrder,
  hardBlockers,
  crossPhaseRules,
  getPhaseLibraries,
  getEstateStats,
  type Phase,
  type Priority,
  type MaturityTier,
  type LibraryUpgrade,
} from "../data/upgrade-matrix";
import { useUpgradeProgress } from "../hooks/use-upgrade-progress";

function priorityVariant(p: Priority) {
  switch (p) {
    case "Critical": return "failure" as const;
    case "High": return "warning" as const;
    case "Medium-High": return "processing" as const;
    case "Medium": return "neutral" as const;
  }
}

function tierColor(t: MaturityTier) {
  switch (t) {
    case "A": return "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.12)]";
    case "B": return "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.12)]";
    case "C": return "text-[hsl(var(--status-failure))] bg-[hsl(var(--status-failure)/0.12)]";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "complete": return <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-success))]" />;
    case "in-progress": return <Clock className="w-4 h-4 text-[hsl(var(--status-processing))]" />;
    default: return <Circle className="w-4 h-4 text-[hsl(var(--muted-foreground)/0.4)]" />;
  }
}

function ScoreBar({ current, target }: { current: number; target: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))] w-7 text-right">{current}</span>
      <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted)/0.5)] relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[hsl(var(--status-processing))] to-[hsl(var(--status-success))]"
          style={{ width: `${current}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[hsl(var(--foreground)/0.6)]"
          style={{ left: `${target}%` }}
        />
      </div>
      <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))] w-7">{target}</span>
    </div>
  );
}

function ProgressBar({ percent, size = "md" }: { percent: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full ${h} rounded-full bg-[hsl(var(--muted)/0.5)] overflow-hidden`}>
      <div
        className={`${h} rounded-full transition-all duration-500 ${
          percent === 100
            ? "bg-[hsl(var(--status-success))]"
            : percent > 0
              ? "bg-gradient-to-r from-[hsl(var(--status-processing))] to-[hsl(var(--status-intelligence))]"
              : ""
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function PhaseTimeline({
  progress,
}: {
  progress: (phase: 1 | 2 | 3) => { total: number; completed: number; percent: number };
}) {
  return (
    <div className="flex items-stretch gap-3">
      {phases.map((p) => {
        const prog = progress(p.phase);
        const phaseLibs = getPhaseLibraries(p.phase);
        return (
          <GlassPanel key={p.phase} className="flex-1 p-4" solid>
            <div className="flex items-center justify-between mb-2">
              <span className="text-system-label">Phase {p.phase}</span>
              <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
                {prog.percent}%
              </span>
            </div>
            <ProgressBar percent={prog.percent} size="sm" />
            <h4 className="text-sm font-medium text-[hsl(var(--foreground))] mt-3 mb-2 leading-snug">
              {p.title}
            </h4>
            <div className="flex flex-wrap gap-1">
              {phaseLibs.map((l) => (
                <span
                  key={l.id}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                >
                  {l.name}
                </span>
              ))}
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}

function LibraryRow({
  lib,
  progress,
  status,
  onStatusChange,
  onNavigate,
}: {
  lib: LibraryUpgrade;
  progress: { completed: number; total: number; percent: number };
  status: string;
  onStatusChange: (s: "not-started" | "in-progress" | "complete") => void;
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_140px_80px_100px_60px_60px_100px] gap-3 items-center px-4 py-3 border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {statusIcon(status)}
        {lib.route ? (
          <button
            onClick={onNavigate}
            className="text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors truncate text-left flex items-center gap-1"
          >
            {lib.name}
            <ArrowUpRight className="w-3 h-3 opacity-40" />
          </button>
        ) : (
          <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
            {lib.name}
          </span>
        )}
        <div className="flex gap-1 flex-wrap">
          {lib.dependencyBlockers.slice(0, 2).map((b) => (
            <span
              key={b}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--status-warning)/0.1)] text-[hsl(var(--status-warning))] truncate max-w-[120px]"
              title={b}
            >
              {b}
            </span>
          ))}
          {lib.dependencyBlockers.length > 2 && (
            <span className="text-[9px] px-1 text-[hsl(var(--muted-foreground))]">
              +{lib.dependencyBlockers.length - 2}
            </span>
          )}
        </div>
      </div>
      <ScoreBar current={lib.currentScore} target={lib.targetScore} />
      <div className="text-center">
        <span className="text-[11px] font-mono-tech px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
          P{lib.phase}
        </span>
      </div>
      <div className="text-center">
        <StatusChip variant={priorityVariant(lib.priority)} label={lib.priority} size="sm" />
      </div>
      <div className="text-center">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierColor(lib.maturityTier)}`}>
          Tier {lib.maturityTier}
        </span>
      </div>
      <div className="text-center">
        <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))]">
          {progress.completed}/{progress.total}
        </span>
      </div>
      <div className="text-center">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as "not-started" | "in-progress" | "complete")}
          className="text-[11px] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 cursor-pointer"
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>
    </div>
  );
}

function PhaseDetailPanel({
  phaseInfo,
  isOpen,
  onToggle,
  progress,
  artifactProgress,
  toggleArtifact,
  isArtifactComplete,
}: {
  phaseInfo: (typeof phases)[0];
  isOpen: boolean;
  onToggle: () => void;
  progress: { total: number; completed: number; percent: number };
  artifactProgress: (libId: string) => { completed: number; total: number; percent: number };
  toggleArtifact: (libId: string, artifact: string) => void;
  isArtifactComplete: (libId: string, artifact: string) => boolean;
}) {
  const phaseLibs = getPhaseLibraries(phaseInfo.phase);
  const glowColor = phaseInfo.phase === 1 ? "red" : phaseInfo.phase === 2 ? "amber" : "cyan";

  return (
    <GlassPanel glow={isOpen ? glowColor : "none"} className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[hsl(var(--muted)/0.2)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Phase {phaseInfo.phase} — {phaseInfo.title}
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{phaseInfo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
            {progress.completed}/{progress.total} artifacts
          </span>
          <div className="w-20">
            <ProgressBar percent={progress.percent} size="sm" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-[hsl(var(--border)/0.5)]">
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <h4 className="text-system-label mb-2">Target Outcomes</h4>
              <div className="space-y-1.5">
                {phaseInfo.targetOutcomes.map((o, i) => (
                  <p key={i} className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed flex gap-2">
                    <Target className="w-3 h-3 mt-0.5 shrink-0 text-[hsl(var(--status-processing))]" />
                    {o}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-system-label mb-2">Expected Results</h4>
              <div className="space-y-1">
                {phaseInfo.expectedResult.map((r, i) => (
                  <p key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                    <Check className="w-3 h-3 text-[hsl(var(--status-success))]" />
                    {r}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-system-label mb-3">Artifact Checklists</h4>
            <div className="grid grid-cols-2 gap-3">
              {phaseLibs.map((lib) => {
                const libProg = artifactProgress(lib.id);
                return (
                  <GlassPanel key={lib.id} solid className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{lib.name}</span>
                      <span className="text-[10px] font-mono-tech text-[hsl(var(--muted-foreground))]">
                        {libProg.completed}/{libProg.total}
                      </span>
                    </div>
                    <ProgressBar percent={libProg.percent} size="sm" />
                    <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                      {lib.requiredArtifacts.map((art) => {
                        const done = isArtifactComplete(lib.id, art);
                        return (
                          <label
                            key={art}
                            className="flex items-start gap-2 cursor-pointer group py-0.5"
                          >
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleArtifact(lib.id, art)}
                              className="mt-0.5 accent-[hsl(var(--status-success))] cursor-pointer"
                            />
                            <span
                              className={`text-[11px] font-mono-tech leading-snug transition-colors ${
                                done
                                  ? "text-[hsl(var(--status-success)/0.7)] line-through"
                                  : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                              }`}
                            >
                              {art}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

export default function KnowledgeDashboardPage() {
  const [, setLocation] = useLocation();
  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 1: true });
  const {
    toggleArtifact,
    setLibraryStatus,
    isArtifactComplete,
    getLibraryStatus,
    getLibraryArtifactProgress,
    getOverallProgress,
    getPhaseProgress,
  } = useUpgradeProgress();

  const overall = getOverallProgress();
  const stats = getEstateStats();
  const criticalCount = libraries.filter((l) => l.priority === "Critical").length;
  const phase1Count = libraries.filter((l) => l.phase === 1).length;
  const phase2Count = libraries.filter((l) => l.phase === 2).length;
  const phase3Count = libraries.filter((l) => l.phase === 3).length;

  const togglePhase = (phase: number) => {
    setOpenPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <GlassPanel glow="violet" className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Library className="w-6 h-6 text-[hsl(var(--status-intelligence))]" />
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Library Upgrade Matrix
              </h1>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xl">
              Track and implement governance upgrades across all 16 Axion libraries. Move the estate
              from structurally strong to fully governed runtime authorities.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono-tech text-[hsl(var(--status-intelligence))]">
              {overall.percent}%
            </div>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
              {overall.completedArtifacts}/{overall.totalArtifacts} artifacts
            </p>
            <div className="w-32 mt-2">
              <ProgressBar percent={overall.percent} />
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-6 gap-3">
        <MetricCard icon={Layers} label="Libraries" value={stats.totalLibraries} accent="violet" subtitle="16 total" />
        <MetricCard icon={BarChart3} label="Avg Score" value={stats.avgCurrent} accent="cyan" subtitle={`Target: ${stats.avgTarget}`} />
        <MetricCard icon={AlertTriangle} label="Critical" value={criticalCount} accent="red" subtitle="Phase 1 priority" />
        <MetricCard icon={Shield} label="Phase 1" value={phase1Count} accent="red" subtitle="Governance gaps" />
        <MetricCard icon={Target} label="Phase 2" value={phase2Count} accent="amber" subtitle="Control surfaces" />
        <MetricCard icon={TrendingUp} label="Phase 3" value={phase3Count} accent="cyan" subtitle="Deepen core" />
      </div>

      <PhaseTimeline progress={getPhaseProgress} />

      <GlassPanel solid className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">All Libraries</h2>
        </div>
        <div className="grid grid-cols-[1fr_140px_80px_100px_60px_60px_100px] gap-3 items-center px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          <span className="text-system-label">Library</span>
          <span className="text-system-label">Score</span>
          <span className="text-system-label text-center">Phase</span>
          <span className="text-system-label text-center">Priority</span>
          <span className="text-system-label text-center">Tier</span>
          <span className="text-system-label text-center">Done</span>
          <span className="text-system-label text-center">Status</span>
        </div>
        {libraries
          .sort((a, b) => a.phase - b.phase || a.phaseOrder - b.phaseOrder)
          .map((lib) => (
            <LibraryRow
              key={lib.id}
              lib={lib}
              progress={getLibraryArtifactProgress(lib.id)}
              status={getLibraryStatus(lib.id)}
              onStatusChange={(s) => setLibraryStatus(lib.id, s)}
              onNavigate={() => setLocation(lib.route)}
            />
          ))}
      </GlassPanel>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[hsl(var(--foreground))] px-1">Phase Details & Artifact Checklists</h2>
        {phases.map((p) => (
          <PhaseDetailPanel
            key={p.phase}
            phaseInfo={p}
            isOpen={!!openPhases[p.phase]}
            onToggle={() => togglePhase(p.phase)}
            progress={getPhaseProgress(p.phase)}
            artifactProgress={getLibraryArtifactProgress}
            toggleArtifact={toggleArtifact}
            isArtifactComplete={isArtifactComplete}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassPanel glow="green" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[hsl(var(--status-success))]" />
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Fastest Lift Per Unit of Effort</h3>
          </div>
          <div className="space-y-2">
            {fastestLiftOrder.map((item, i) => {
              const lib = libraries.find((l) => l.id === item.id)!;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)]"
                >
                  <span className="text-lg font-bold font-mono-tech text-[hsl(var(--status-success)/0.6)] w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{lib.name}</span>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{item.reason}</p>
                  </div>
                  <span className="text-xs font-mono-tech text-[hsl(var(--muted-foreground))]">
                    +{lib.targetScore - lib.currentScore} pts
                  </span>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <div className="space-y-4">
          <GlassPanel glow="amber" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-warning))]" />
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Hard Blockers to Solve Early</h3>
            </div>
            <div className="space-y-3">
              {hardBlockers.map((blocker) => (
                <div key={blocker.id}>
                  <h4 className="text-xs font-medium text-[hsl(var(--foreground))] mb-1">
                    {blocker.id}. {blocker.title}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {blocker.items.map((item) => (
                      <span
                        key={item}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--status-warning)/0.1)] text-[hsl(var(--status-warning))]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel solid className="p-5">
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Cross-Phase Rules</h3>
            <div className="space-y-2">
              {crossPhaseRules.map((rule) => (
                <div key={rule.id} className="flex gap-2 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)]">
                  <span className="text-[10px] font-mono-tech text-[hsl(var(--status-processing))] shrink-0 mt-0.5">
                    {rule.id}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[hsl(var(--foreground))]">{rule.title}</p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
