import { useLocation } from "wouter";
import type { CapabilityRecord } from "../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForImplementation,
  badgeToneForRisk,
  badgeToneForHealth,
} from "./CapabilityBadge";
import { MetricChip } from "./MetricChip";

interface CapabilityCardCompactProps {
  record: CapabilityRecord;
}

export function CapabilityCardCompact({ record }: CapabilityCardCompactProps) {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation(`/features/${record.feature_id}`)}
      className="w-full text-left rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] shrink-0">
            {record.feature_id}
          </span>
          <span className="text-xs font-medium text-[hsl(var(--card-foreground))] truncate">
            {record.title}
          </span>
        </div>
        <CapabilityBadge
          label={record.implementationStatus.replace("_", " ")}
          tone={badgeToneForImplementation(record.implementationStatus)}
          kind="implementation"
          size="sm"
          dot
        />
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <CapabilityBadge
          label={record.riskLevel}
          tone={badgeToneForRisk(record.riskLevel)}
          kind="risk"
          size="sm"
        />
        <CapabilityBadge
          label={record.dependencyHealth}
          tone={badgeToneForHealth(record.dependencyHealth)}
          kind="health"
          size="sm"
        />
        <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] tabular-nums ml-auto">
          {record.readinessScore}%
        </span>
      </div>

      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
        <MetricChip count={record.moduleCount} label="mod" tone="gray" size="sm" />
        <MetricChip count={record.gateCount} label="gate" tone="gray" size="sm" />
        <MetricChip count={record.dependencyCount} label="dep" tone="gray" size="sm" />
        {record.warningCount > 0 && (
          <MetricChip count={record.warningCount} label="warn" tone="amber" size="sm" />
        )}
      </div>
    </button>
  );
}
