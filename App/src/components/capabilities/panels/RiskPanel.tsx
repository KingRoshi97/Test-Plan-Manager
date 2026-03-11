import type { CapabilityRecord, RiskLevel } from "../../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForRisk,
  badgeToneForHealth,
  badgeToneForImplementation,
} from "../CapabilityBadge";
import type { BadgeTone } from "../CapabilityBadge";
import { MetricChip } from "../MetricChip";
import { WarningPill } from "../WarningPill";
import { CapabilitiesEmptyState } from "../CapabilitiesEmptyState";
import { useLocation } from "wouter";
import { ChevronRight, ShieldAlert, Zap, AlertTriangle, Ban } from "lucide-react";

interface RiskPanelProps {
  records: CapabilityRecord[];
  groupedByRisk: Record<RiskLevel, CapabilityRecord[]>;
  onReset?: () => void;
}

interface RiskSummaryItem {
  label: string;
  level: RiskLevel;
  count: number;
  tone: BadgeTone;
}

function RiskSummaryRow({ records }: { records: CapabilityRecord[] }) {
  const counts: RiskSummaryItem[] = [
    { label: "Critical", level: "critical", count: records.filter((r) => r.riskLevel === "critical").length, tone: "red" },
    { label: "High", level: "high", count: records.filter((r) => r.riskLevel === "high").length, tone: "red" },
    { label: "Moderate", level: "moderate", count: records.filter((r) => r.riskLevel === "moderate").length, tone: "amber" },
    { label: "Low", level: "low", count: records.filter((r) => r.riskLevel === "low").length, tone: "green" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {counts.map((item) => (
        <div
          key={item.level}
          className={`rounded-lg border px-4 py-3 text-center ${
            item.tone === "red"
              ? "bg-[hsl(0_72%_51%/0.08)] border-[hsl(0_72%_51%/0.2)]"
              : item.tone === "amber"
                ? "bg-[hsl(38_90%_50%/0.08)] border-[hsl(38_90%_50%/0.2)]"
                : "bg-[hsl(145_65%_48%/0.08)] border-[hsl(145_65%_48%/0.2)]"
          }`}
        >
          <div
            className={`text-xl font-bold tabular-nums ${
              item.tone === "red"
                ? "text-[hsl(0,72%,65%)]"
                : item.tone === "amber"
                  ? "text-[hsl(38,90%,65%)]"
                  : "text-[hsl(145,65%,60%)]"
            }`}
          >
            {item.count}
          </div>
          <div
            className={`text-[11px] font-medium ${
              item.tone === "red"
                ? "text-[hsl(0,72%,51%/0.7)]"
                : item.tone === "amber"
                  ? "text-[hsl(38,90%,50%/0.7)]"
                  : "text-[hsl(145,65%,48%/0.7)]"
            }`}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function HighRiskSection({
  title,
  icon: Icon,
  records,
  tone,
}: {
  title: string;
  icon: typeof ShieldAlert;
  records: CapabilityRecord[];
  tone: BadgeTone;
}) {
  if (records.length === 0) return null;

  const borderColor =
    tone === "red"
      ? "border-[hsl(0_72%_51%/0.2)]"
      : tone === "amber"
        ? "border-[hsl(38_90%_50%/0.2)]"
        : "border-[hsl(var(--border))]";

  const iconColor =
    tone === "red"
      ? "text-[hsl(0,72%,65%)]"
      : tone === "amber"
        ? "text-[hsl(38,90%,65%)]"
        : "text-[hsl(var(--muted-foreground))]";

  return (
    <div className={`rounded-lg border ${borderColor} bg-[hsl(var(--card))] p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="text-sm font-medium text-[hsl(var(--card-foreground))]">{title}</h4>
        <span className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">({records.length})</span>
      </div>
      <div className="space-y-1.5">
        {records.map((r) => (
          <div key={r.feature_id} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[hsl(var(--muted-foreground))] shrink-0">{r.feature_id}</span>
            <span className="text-[hsl(var(--card-foreground))] truncate">{r.title}</span>
            <CapabilityBadge label={r.riskLevel} tone={badgeToneForRisk(r.riskLevel)} kind="risk" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HighRiskPanel({ records }: { records: CapabilityRecord[] }) {
  const criticalRisk = records.filter((r) => r.riskLevel === "critical");
  const highBlastRadius = records.filter((r) => r.impactCount >= 3);
  const activeUnsupported = records.filter(
    (r) =>
      r.registryStatus === "active" &&
      (r.moduleHealth === "missing" || r.gateHealth === "missing") &&
      (r.riskLevel === "high" || r.riskLevel === "critical")
  );
  const blockedCritical = records.filter(
    (r) =>
      r.implementationStatus === "blocked" &&
      (r.riskLevel === "high" || r.riskLevel === "critical")
  );

  if (
    criticalRisk.length === 0 &&
    highBlastRadius.length === 0 &&
    activeUnsupported.length === 0 &&
    blockedCritical.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <HighRiskSection title="Critical Risk" icon={ShieldAlert} records={criticalRisk} tone="red" />
      <HighRiskSection title="High Blast Radius" icon={Zap} records={highBlastRadius} tone="red" />
      <HighRiskSection title="Active but Unsupported" icon={AlertTriangle} records={activeUnsupported} tone="amber" />
      <HighRiskSection title="Blocked Critical Path" icon={Ban} records={blockedCritical} tone="red" />
    </div>
  );
}

function RiskCard({ record }: { record: CapabilityRecord }) {
  const [, setLocation] = useLocation();

  const riskReasons: string[] = [];
  if (record.blockerCount > 0) riskReasons.push(`${record.blockerCount} blocker(s)`);
  if (record.unresolvedDependencies.length > 0)
    riskReasons.push(`${record.unresolvedDependencies.length} unresolved dep(s)`);
  if (record.moduleHealth === "missing") riskReasons.push("No linked modules");
  if (record.gateHealth === "missing") riskReasons.push("No gates defined");
  if (record.implementationStatus === "blocked") riskReasons.push("Implementation blocked");
  if (record.registryStatus === "error") riskReasons.push("Registry error state");
  if (record.dependencyHealth === "blocked") riskReasons.push("Upstream dependency blocked");

  const weakSupport =
    record.registryStatus === "active" &&
    (record.moduleHealth === "missing" || record.gateHealth === "missing");

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
            label={record.riskLevel}
            tone={badgeToneForRisk(record.riskLevel)}
            kind="risk"
            dot
            pulse={record.riskLevel === "critical"}
          />
          <CapabilityBadge
            label={record.implementationStatus.replace("_", " ")}
            tone={badgeToneForImplementation(record.implementationStatus)}
            kind="implementation"
          />
          <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors ml-1" />
        </div>
      </div>

      {riskReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {riskReasons.map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center rounded-md bg-[hsl(0_72%_51%/0.08)] text-[hsl(0,72%,65%)] px-2 py-0.5 text-[11px] font-medium"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {record.impactCount > 0 && (
          <MetricChip count={record.impactCount} label="blast radius" tone="red" />
        )}
        <MetricChip
          count={record.dependencyCount}
          label="deps"
          tone={record.dependencyHealth === "blocked" ? "red" : "violet"}
        />
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
        <CapabilityBadge
          label={`deps: ${record.dependencyHealth}`}
          tone={badgeToneForHealth(record.dependencyHealth)}
          kind="health"
        />
      </div>

      {weakSupport && (
        <div className="mt-2">
          <WarningPill
            message="Active capability with weak support coverage"
            severity="high"
            compact
          />
        </div>
      )}
    </button>
  );
}

export function RiskPanel({ records, groupedByRisk, onReset }: RiskPanelProps) {
  if (records.length === 0) {
    return <CapabilitiesEmptyState message="No capabilities match the current filters." onReset={onReset} />;
  }

  const sortedRecords = [...records].sort((a, b) => {
    const order: Record<RiskLevel, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
    return order[a.riskLevel] - order[b.riskLevel];
  });

  return (
    <div className="space-y-6">
      <RiskSummaryRow records={records} />
      <HighRiskPanel records={records} />
      <div className="grid gap-3">
        {sortedRecords.map((record) => (
          <RiskCard key={record.feature_id} record={record} />
        ))}
      </div>
    </div>
  );
}
