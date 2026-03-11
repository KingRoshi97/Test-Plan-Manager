import type { CapabilityRecord } from "../../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForHealth,
  badgeToneForImplementation,
} from "../CapabilityBadge";
import { MetricChip } from "../MetricChip";
import { CapabilitiesEmptyState } from "../CapabilitiesEmptyState";
import { useLocation } from "wouter";
import { ArrowDown, ArrowUp, Link2, Unlink, ChevronRight } from "lucide-react";

interface DependenciesPanelProps {
  records: CapabilityRecord[];
  onReset?: () => void;
}

function DependencyHealthSummary({ records }: { records: CapabilityRecord[] }) {
  const healthy = records.filter((r) => r.dependencyHealth === "healthy").length;
  const warning = records.filter((r) => r.dependencyHealth === "warning").length;
  const blocked = records.filter((r) => r.dependencyHealth === "blocked").length;
  const unknown = records.filter((r) => r.dependencyHealth === "unknown").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1">
          Healthy
        </div>
        <div className="text-xl font-semibold tabular-nums text-[hsl(145,65%,60%)]">
          {healthy}
        </div>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1">
          Warning
        </div>
        <div className="text-xl font-semibold tabular-nums text-[hsl(38,90%,65%)]">
          {warning}
        </div>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1">
          Blocked
        </div>
        <div className="text-xl font-semibold tabular-nums text-[hsl(0,72%,65%)]">
          {blocked}
        </div>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1">
          Unknown
        </div>
        <div className="text-xl font-semibold tabular-nums text-[hsl(var(--muted-foreground))]">
          {unknown}
        </div>
      </div>
    </div>
  );
}

function DependencyCard({ record }: { record: CapabilityRecord }) {
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
            label={`deps: ${record.dependencyHealth}`}
            tone={badgeToneForHealth(record.dependencyHealth)}
            kind="health"
            dot
          />
          <CapabilityBadge
            label={record.implementationStatus.replace("_", " ")}
            tone={badgeToneForImplementation(record.implementationStatus)}
            kind="implementation"
          />
          <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors ml-1" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <MetricChip
          count={record.dependencyCount}
          label="deps"
          tone={record.dependencyCount > 0 ? "violet" : "gray"}
        />
        <MetricChip
          count={record.reverseDependencies.length}
          label="dependents"
          tone={record.reverseDependencies.length > 0 ? "blue" : "gray"}
        />
        <MetricChip
          count={record.unresolvedDependencies.length}
          label="unresolved"
          tone={record.unresolvedDependencies.length > 0 ? "red" : "gray"}
        />
        <MetricChip
          count={record.impactCount}
          label="impact"
          tone={record.impactCount > 3 ? "amber" : "gray"}
        />
        {record.blockerCount > 0 && (
          <MetricChip count={record.blockerCount} label="blockers" tone="red" />
        )}
      </div>

      {record.dependencies.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
            <ArrowUp className="w-3 h-3" />
            Depends on
          </div>
          <div className="flex flex-wrap gap-1">
            {record.dependencies.map((dep) => {
              const isUnresolved = record.unresolvedDependencies.includes(dep);
              return (
                <span
                  key={dep}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono ${
                    isUnresolved
                      ? "bg-[hsl(0_72%_51%/0.08)] text-[hsl(0,72%,65%)] border border-[hsl(0_72%_51%/0.18)]"
                      : "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {isUnresolved ? (
                    <Unlink className="w-3 h-3" />
                  ) : (
                    <Link2 className="w-3 h-3" />
                  )}
                  {dep}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {record.reverseDependencies.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1.5">
            <ArrowDown className="w-3 h-3" />
            Depended on by
          </div>
          <div className="flex flex-wrap gap-1">
            {record.reverseDependencies.map((dep) => (
              <span
                key={dep}
                className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--muted)/0.5)] px-2 py-0.5 text-[11px] font-mono text-[hsl(var(--muted-foreground))]"
              >
                <Link2 className="w-3 h-3" />
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

export function DependenciesPanel({ records, onReset }: DependenciesPanelProps) {
  if (records.length === 0) {
    return (
      <CapabilitiesEmptyState
        message="No capabilities found for current filter set."
        onReset={onReset}
      />
    );
  }

  const sorted = [...records].sort((a, b) => {
    const healthOrder: Record<string, number> = {
      blocked: 0,
      warning: 1,
      unknown: 2,
      healthy: 3,
    };
    const aOrder = healthOrder[a.dependencyHealth] ?? 4;
    const bOrder = healthOrder[b.dependencyHealth] ?? 4;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.impactCount - a.impactCount;
  });

  return (
    <div className="space-y-6">
      <DependencyHealthSummary records={records} />
      <div className="grid gap-3">
        {sorted.map((record) => (
          <DependencyCard key={record.feature_id} record={record} />
        ))}
      </div>
    </div>
  );
}
