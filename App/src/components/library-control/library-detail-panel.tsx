import {
  X,
  Shield,
  HeartPulse,
  AlertTriangle,
  GitFork,
  Lightbulb,
  Play,
} from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { StatusChip, type StatusVariant } from "../ui/status-chip";
import type { LibraryDetail, RiskLevel } from "../../data/library-control";

function urgencyVariant(level: RiskLevel): StatusVariant {
  switch (level) {
    case "low": return "success";
    case "moderate": return "warning";
    case "high": return "failure";
    case "critical": return "failure";
  }
}

function percentIndicator(label: string, value: number) {
  const color =
    value >= 80
      ? "text-[hsl(var(--status-success))]"
      : value >= 60
      ? "text-[hsl(var(--status-warning))]"
      : "text-[hsl(var(--status-failure))]";
  return (
    <div className="flex items-center justify-between">
      <span className="text-system-label">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>
        {value}%
      </span>
    </div>
  );
}

function listSection(title: string, items: string[]) {
  if (!items.length || (items.length === 1 && items[0].startsWith("None"))) return null;
  return (
    <div className="space-y-1">
      <span className="text-system-label">{title}</span>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex items-start gap-1.5">
            <span className="text-[hsl(var(--status-warning))] mt-0.5">&#8226;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface LibraryDetailPanelProps {
  detail: LibraryDetail | null;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

export function LibraryDetailPanel({ detail, onClose, onAction }: LibraryDetailPanelProps) {
  if (!detail) return null;

  return (
    <GlassPanel glow="cyan" className="p-5 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-xs text-[hsl(var(--muted-foreground))]">
              {detail.shortName}
            </span>
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {detail.name}
            </h3>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {detail.purpose}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <Shield className="w-4 h-4 text-[hsl(var(--primary))]" />
            Identity
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Owner</span>
              <span className="text-[hsl(var(--foreground))]">{detail.owner ?? "Unassigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Estate Role</span>
              <span className="text-[hsl(var(--foreground))]">{detail.estateRole ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Route</span>
              <span className="font-mono-tech text-[hsl(var(--primary))]">{detail.route ?? "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <Shield className="w-4 h-4 text-[hsl(var(--status-success))]" />
            Governance State
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-system-label">Authority</span>
              <StatusChip
                variant={detail.authorityStatus === "authoritative" ? "success" : detail.authorityStatus === "partial" ? "warning" : "failure"}
                label={detail.authorityStatus}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-system-label">Trust</span>
              <StatusChip
                variant={detail.trustDecision === "trusted" ? "success" : detail.trustDecision === "conditional" ? "warning" : "failure"}
                label={detail.trustDecision}
                size="sm"
              />
            </div>
            {detail.authoritySource && (
              <div className="flex justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">Source</span>
                <span className="text-[hsl(var(--foreground))]">{detail.authoritySource}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <HeartPulse className="w-4 h-4 text-[hsl(var(--status-processing))]" />
            Health State
          </div>
          <div className="space-y-2">
            {percentIndicator("Coverage", detail.coveragePercent)}
            {percentIndicator("Freshness", detail.freshnessPercent)}
            {percentIndicator("Integrity", detail.integrityPercent)}
            {percentIndicator("Dep. Fitness", detail.dependencyFitnessPercent)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-warning))]" />
            Gap Summary
          </div>
          <div className="space-y-2">
            {listSection("Missing Artifacts", detail.missingArtifacts)}
            {listSection("Stale Artifacts", detail.staleArtifacts)}
            {listSection("Broken References", detail.brokenReferences)}
            {listSection("Unresolved Conflicts", detail.unresolvedConflicts)}
            {listSection("Unsupported Dependents", detail.unsupportedDependents)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[hsl(var(--border))]">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <GitFork className="w-4 h-4 text-[hsl(var(--status-intelligence))]" />
            Dependency Surface
          </div>
          <div className="space-y-1 text-xs">
            {detail.upstreamDependencies.length > 0 && (
              <div>
                <span className="text-system-label">Upstream: </span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {detail.upstreamDependencies.join(", ")}
                </span>
              </div>
            )}
            {detail.downstreamDependents.length > 0 && (
              <div>
                <span className="text-system-label">Downstream: </span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {detail.downstreamDependents.join(", ")}
                </span>
              </div>
            )}
            {detail.blockerImpact.length > 0 && (
              <div>
                <span className="text-system-label">Blocker Impact: </span>
                <span className="text-[hsl(var(--status-failure))] text-[11px]">
                  {detail.blockerImpact.join("; ")}
                </span>
              </div>
            )}
            {detail.upstreamDependencies.length === 0 &&
              detail.downstreamDependents.length === 0 &&
              detail.blockerImpact.length === 0 && (
                <span className="text-[hsl(var(--muted-foreground))]">No significant dependency surface.</span>
              )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <Lightbulb className="w-4 h-4 text-[hsl(var(--status-warning))]" />
            Recommended Action
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {detail.recommendedAction}
          </p>
          <div className="flex items-center gap-2">
            <StatusChip
              variant={urgencyVariant(detail.urgency)}
              label={`Urgency: ${detail.urgency}`}
              size="sm"
            />
            {detail.suggestedMaintenanceMode && (
              <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">
                Mode: {detail.suggestedMaintenanceMode}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
            <Play className="w-4 h-4 text-[hsl(var(--primary))]" />
            Control Actions
          </div>
          <div className="flex flex-wrap gap-2">
            {["Health Check", "Coverage Audit", "Drift Detection", "Repair"].map(
              (action) => (
                <button
                  key={action}
                  onClick={() => onAction?.(action.toLowerCase().replace(/\s+/g, "-"))}
                  className="text-[10px] px-2.5 py-1 rounded border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                >
                  {action}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
