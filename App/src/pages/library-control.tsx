import {
  Library,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Eye,
  Clock,
  Gauge,
  HeartPulse,
  ScanSearch,
  GitCompareArrows,
  DatabaseZap,
  ShieldAlert,
  RefreshCcw,
  TriangleAlert,
  Hammer,
  Zap,
  ArrowRight,
  Activity,
  Link2,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { GlassPanel } from "../components/ui/glass-panel";
import { MetricCard } from "../components/ui/metric-card";
import { StatusChip } from "../components/ui/status-chip";
import { useLibraryControl } from "../hooks/use-library-control";
import {
  libraryControlCenterState,
  LIBRARIES,
  type ControlActionType,
  type RiskLevel,
} from "../data/library-control";
import { HealthOverview } from "../components/library-control/health-overview";
import { LibraryEstateTable } from "../components/library-control/library-estate-table";
import { LibraryDetailPanel } from "../components/library-control/library-detail-panel";
import { MaintenanceModes } from "../components/library-control/maintenance-modes";

const ACTION_ICONS: Record<ControlActionType, LucideIcon> = {
  "health-check": HeartPulse,
  "coverage-audit": ScanSearch,
  "drift-detection": GitCompareArrows,
  "rebuild-registries": DatabaseZap,
  "review-authority-gaps": ShieldAlert,
  "dependency-refresh": RefreshCcw,
  "open-unsafe": TriangleAlert,
  "resolve-blockers": Hammer,
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "text-emerald-400",
  moderate: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

const IMPACT_COLORS: Record<string, string> = {
  local: "text-cyan-400",
  "cross-library": "text-amber-400",
  "estate-wide": "text-red-400",
};

const EFFORT_LABELS: Record<string, string> = {
  small: "Low effort",
  medium: "Medium effort",
  large: "High effort",
};

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "audit-run": ShieldCheck,
  "drift-detected": GitCompareArrows,
  "authority-restored": ShieldCheck,
  "blocker-cleared": Hammer,
  "registry-rebuilt": DatabaseZap,
  downgraded: AlertTriangle,
  restored: ShieldCheck,
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function LibraryControlCenterPage() {
  const ctrl = useLibraryControl();

  const {
    header,
    metrics,
    healthBands,
    leverageFixes,
    blockers,
    risks,
    governanceRules,
    maintenanceModes,
    dependencyLinks,
    recentActivity,
    actions,
  } = libraryControlCenterState;

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      {/* A. Hero / Command Header */}
      <GlassPanel glow="cyan">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Library className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Library Control Center</h1>
                <StatusChip variant="intelligence" label="CONTROL AUTHORITY" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Central authority for governing, inspecting, maintaining, and directing the Axion library system.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{header.controlScore}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono uppercase">Control Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{header.governedLibraries}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono uppercase">Governed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{header.activeRisks}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono uppercase">Active Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{header.blockedDependencies}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono uppercase">Blocked</div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* B. Estate Status Cards */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Estate Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <MetricCard
            icon={Library}
            value={metrics.totalLibraries}
            label="Total"
            accent="cyan"
          />
          <MetricCard
            icon={ShieldCheck}
            value={metrics.governed}
            label="Governed"
            accent="green"
            onClick={() => ctrl.setControlStateFilter(["governed"])}
          />
          <MetricCard
            icon={Eye}
            value={metrics.reviewRequired}
            label="Review"
            accent="amber"
            onClick={() => ctrl.setControlStateFilter(["review-required"])}
          />
          <MetricCard
            icon={Clock}
            value={metrics.stale}
            label="Stale"
            accent="amber"
            onClick={ctrl.toggleStaleOnly}
          />
          <MetricCard
            icon={AlertTriangle}
            value={metrics.unsafe}
            label="Unsafe"
            accent="red"
            onClick={ctrl.applyUnsafePreset}
          />
          <MetricCard
            icon={Ban}
            value={metrics.blocked}
            label="Blocked"
            accent="red"
            onClick={ctrl.applyBlockedPreset}
          />
          <MetricCard
            icon={ShieldAlert}
            value={metrics.missingAuthority}
            label="No Auth"
            accent="red"
            onClick={ctrl.applyMissingAuthorityPreset}
          />
          <MetricCard
            icon={GitCompareArrows}
            value={metrics.driftAlerts}
            label="Drift"
            accent="amber"
            onClick={ctrl.applyDriftPreset}
          />
        </div>
      </div>

      {/* C. Control Actions Strip */}
      <GlassPanel>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
          Control Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action.actionType];
            return (
              <button
                key={action.id}
                onClick={() => ctrl.runControlAction(action.actionType)}
                disabled={!action.enabled}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                  bg-[hsl(var(--card))] border border-[hsl(var(--border))]
                  text-[hsl(var(--foreground))]
                  hover:border-cyan-500/50 hover:bg-cyan-500/10
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200"
              >
                {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
                {action.label}
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {/* D. Library Health Overview */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Library Health Overview
        </h2>
        <HealthOverview
          healthBands={healthBands}
          onBandClick={(bandId) => {
            ctrl.clearFilters();
            switch (bandId) {
              case "authoritative":
                ctrl.setAuthorityFilter(["authoritative"]);
                break;
              case "stable":
                ctrl.setControlStateFilter(["governed"]);
                break;
              case "incomplete":
                ctrl.setAuthorityFilter(["partial"]);
                break;
              case "stale":
                ctrl.toggleStaleOnly();
                break;
              case "fragmented":
                ctrl.applyBlockedPreset();
                break;
              case "untrusted":
                ctrl.applyUnsafePreset();
                break;
            }
          }}
        />
      </div>

      {/* E. Library Estate Table */}
      <LibraryEstateTable
        libraries={ctrl.filteredLibraries}
        filters={ctrl.filters}
        selectedLibraryId={ctrl.selectedLibraryId}
        onSelectLibrary={ctrl.selectLibrary}
        onFilterChange={ctrl.updateFilters}
      />

      {/* F. Selected Library Detail Panel */}
      {ctrl.selectedLibrary && (
        <LibraryDetailPanel
          detail={ctrl.selectedLibrary}
          onClose={ctrl.clearSelectedLibrary}
          onAction={(actionType) => ctrl.runControlAction(actionType)}
        />
      )}

      {/* G. Highest Leverage Fixes */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Highest Leverage Fixes
        </h2>
        <div className="space-y-3">
          {leverageFixes.map((fix, idx) => (
            <GlassPanel key={fix.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{fix.title}</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fix.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-mono text-cyan-400">
                        {LIBRARIES.find((l) => l.id === fix.libraryId)?.name ?? fix.libraryId}
                      </span>
                      <span className={`text-xs font-mono ${IMPACT_COLORS[fix.impactRadius] ?? "text-gray-400"}`}>
                        {fix.impactRadius}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {EFFORT_LABELS[fix.effort] ?? fix.effort}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-emerald-400">{fix.recommendedAction}</span>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* H. Blockers and Risks */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-400" />
          Blockers and Risks
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassPanel glow="red">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Active Blockers</h3>
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div key={blocker.id} className="p-3 rounded-md bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusChip variant={blocker.severity === "critical" ? "failure" : "warning"} label={blocker.severity.toUpperCase()} />
                    <span className="text-sm font-medium text-white">{blocker.title}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {blocker.items.map((item, i) => (
                      <li key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {blocker.affectedLibraries.map((libId) => (
                      <span key={libId} className="text-xs font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">
                        {LIBRARIES.find((l) => l.id === libId)?.shortName ?? libId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel glow="amber">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">System Risks</h3>
            <div className="space-y-3">
              {risks.map((risk) => (
                <div key={risk.id} className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusChip variant={risk.severity === "critical" ? "failure" : "warning"} label={risk.severity.toUpperCase()} />
                    <span className="text-sm font-medium text-white">{risk.title}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{risk.summary}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {risk.affectedLibraries.map((libId) => (
                      <span key={libId} className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                        {LIBRARIES.find((l) => l.id === libId)?.shortName ?? libId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* I. Library Governance Rules */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Library Governance Rules
        </h2>
        <div className="space-y-2">
          {governanceRules.map((rule) => (
            <GlassPanel key={rule.id}>
              <div className="flex items-start gap-3">
                <StatusChip
                  variant={rule.severity === "strict" ? "failure" : rule.severity === "warning" ? "warning" : "neutral"}
                  label={rule.severity.toUpperCase()}
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{rule.title}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{rule.description}</p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

      {/* J. Maintenance Modes */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Hammer className="w-4 h-4" />
          Maintenance Modes
        </h2>
        <MaintenanceModes
          modes={maintenanceModes}
          onLaunch={(modeId) => {
            console.log(`[LCC] Launch maintenance mode: ${modeId}`);
          }}
        />
      </div>

      {/* K. Dependency and Authority Map */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Dependency and Authority Map
        </h2>
        <GlassPanel>
          <div className="space-y-2">
            {dependencyLinks.map((link, idx) => {
              const fromLib = LIBRARIES.find((l) => l.id === link.fromLibraryId);
              const toLib = LIBRARIES.find((l) => l.id === link.toLibraryId);
              const relationColors: Record<string, string> = {
                "depends-on": "text-cyan-400",
                governs: "text-violet-400",
                blocks: "text-red-400",
                supports: "text-emerald-400",
              };
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-md bg-[hsl(var(--card))]/50
                    border border-[hsl(var(--border))]/30"
                >
                  <span className="text-sm font-mono text-white min-w-[80px]">
                    {fromLib?.shortName ?? link.fromLibraryId}
                  </span>
                  <span className={`text-xs font-mono ${relationColors[link.relation] ?? "text-gray-400"}`}>
                    {link.relation}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-sm font-mono text-white min-w-[80px]">
                    {toLib?.shortName ?? link.toLibraryId}
                  </span>
                  {link.severity && (
                    <StatusChip
                      variant={
                        link.severity === "critical"
                          ? "failure"
                          : link.severity === "high"
                          ? "warning"
                          : "neutral"
                      }
                      label={link.severity}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* L. Recent Library Activity */}
      <div>
        <h2 className="text-sm font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent Library Activity
        </h2>
        <GlassPanel>
          <div className="space-y-3">
            {recentActivity.map((event) => {
              const Icon = ACTIVITY_ICONS[event.type] ?? Activity;
              const lib = event.libraryId ? LIBRARIES.find((l) => l.id === event.libraryId) : null;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{event.title}</span>
                      {lib && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                          {lib.shortName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{event.summary}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 font-mono">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
