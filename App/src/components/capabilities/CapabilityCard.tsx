import { useLocation } from "wouter";
import type { CapabilityRecord } from "../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForImplementation,
  badgeToneForRisk,
  badgeToneForCategory,
  badgeToneForRegistryStatus,
  badgeToneForHealth,
} from "./CapabilityBadge";
import { MetricChip } from "./MetricChip";
import { WarningPill } from "./WarningPill";
import type { WarningSeverity } from "./WarningPill";
import type { AttentionFlag } from "../../types/capabilities";
import { ChevronRight } from "lucide-react";

interface CapabilityCardProps {
  record: CapabilityRecord;
}

const flagMessages: Record<AttentionFlag, string> = {
  active_without_modules: "Active with no linked modules",
  active_without_gates: "Active with no gates defined",
  implementation_ahead_of_registry: "Implementation ahead of registry state",
  blocked_by_dependency: "Blocked by upstream dependency",
  error_state: "Registry in error state",
  registry_state_review: "Registry state needs review",
  active_but_incomplete: "Active but implementation incomplete",
  dependency_health_unknown: "Dependency health unknown",
};

const flagSeverity: Record<AttentionFlag, WarningSeverity> = {
  active_without_modules: "high",
  active_without_gates: "high",
  implementation_ahead_of_registry: "moderate",
  blocked_by_dependency: "critical",
  error_state: "critical",
  registry_state_review: "moderate",
  active_but_incomplete: "moderate",
  dependency_health_unknown: "info",
};

export function CapabilityCard({ record }: CapabilityCardProps) {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation(`/features/${record.feature_id}`)}
      className="w-full text-left rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] shrink-0">
            {record.feature_id}
          </span>
          <h3 className="font-medium text-[hsl(var(--card-foreground))] truncate">
            {record.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CapabilityBadge
            label={record.implementationStatus.replace("_", " ")}
            tone={badgeToneForImplementation(record.implementationStatus)}
            kind="implementation"
            dot
          />
          <CapabilityBadge
            label={record.riskLevel}
            tone={badgeToneForRisk(record.riskLevel)}
            kind="risk"
          />
          <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors ml-1" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <CapabilityBadge
          label={record.category}
          tone={badgeToneForCategory(record.category)}
          kind="category"
        />
        <CapabilityBadge
          label={record.registryStatus}
          tone={badgeToneForRegistryStatus(record.registryStatus)}
          kind="registry"
        />
        <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] tabular-nums">
          Readiness {record.readinessScore}%
        </span>
        <CapabilityBadge
          label={`deps: ${record.dependencyHealth}`}
          tone={badgeToneForHealth(record.dependencyHealth)}
          kind="health"
        />
      </div>

      {record.description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 line-clamp-2">
          {record.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <MetricChip
          count={record.moduleCount}
          label="modules"
          tone={record.moduleCount > 0 ? "blue" : "red"}
        />
        <MetricChip
          count={record.gateCount}
          label="gates"
          tone={record.gateCount > 0 ? "cyan" : "red"}
        />
        <MetricChip
          count={record.dependencyCount}
          label="deps"
          tone={record.dependencyCount > 0 ? "violet" : "gray"}
        />
        {record.blockerCount > 0 && (
          <MetricChip count={record.blockerCount} label="blockers" tone="red" />
        )}
        {record.warningCount > 0 && (
          <MetricChip
            count={record.warningCount}
            label="warnings"
            tone="amber"
          />
        )}
      </div>

      {record.attentionFlags.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {record.attentionFlags.map((flag) => (
            <WarningPill
              key={flag}
              message={flagMessages[flag]}
              severity={flagSeverity[flag]}
              compact
            />
          ))}
        </div>
      )}
    </button>
  );
}
