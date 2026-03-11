import type { CapabilityRecord } from "../../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForHealth,
  badgeToneForImplementation,
} from "../CapabilityBadge";
import { MetricChip } from "../MetricChip";
import { WarningPill } from "../WarningPill";
import { CapabilitiesEmptyState } from "../CapabilitiesEmptyState";
import { useLocation } from "wouter";
import { ChevronRight, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

interface GatesPanelProps {
  records: CapabilityRecord[];
  onReset?: () => void;
}

interface GateSummary {
  covered: number;
  partial: number;
  missing: number;
  failed: number;
  unknown: number;
}

function computeGateSummary(records: CapabilityRecord[]): GateSummary {
  const summary: GateSummary = { covered: 0, partial: 0, missing: 0, failed: 0, unknown: 0 };
  for (const r of records) {
    switch (r.gateHealth) {
      case "covered":
        summary.covered++;
        break;
      case "partial":
        summary.partial++;
        break;
      case "missing":
        summary.missing++;
        break;
      case "failed":
        summary.failed++;
        break;
      default:
        summary.unknown++;
        break;
    }
  }
  return summary;
}

function GateSummaryStrip({ summary }: { summary: GateSummary }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[hsl(145,65%,60%)]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Covered</span>
        </div>
        <span className="text-xl font-semibold text-[hsl(145,65%,60%)] tabular-nums">{summary.covered}</span>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[hsl(38,90%,65%)]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Partial</span>
        </div>
        <span className="text-xl font-semibold text-[hsl(38,90%,65%)] tabular-nums">{summary.partial}</span>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-[hsl(0,72%,65%)]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Missing</span>
        </div>
        <span className="text-xl font-semibold text-[hsl(0,72%,65%)] tabular-nums">{summary.missing}</span>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 text-[hsl(0,72%,65%)]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Failed</span>
        </div>
        <span className="text-xl font-semibold text-[hsl(0,72%,65%)] tabular-nums">{summary.failed}</span>
      </div>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldQuestion className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">Unknown</span>
        </div>
        <span className="text-xl font-semibold text-[hsl(var(--muted-foreground))] tabular-nums">{summary.unknown}</span>
      </div>
    </div>
  );
}

function GateWarningsPanel({ records }: { records: CapabilityRecord[] }) {
  const activeNoGates = records.filter(
    (r) => r.registryStatus === "active" && r.gateCount === 0
  );
  const weakCoverage = records.filter(
    (r) => r.gateHealth === "partial" && r.registryStatus === "active"
  );

  if (activeNoGates.length === 0 && weakCoverage.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">Gate Warnings</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeNoGates.length > 0 && (
          <div className="rounded-lg border border-[hsl(0_72%_51%/0.25)] bg-[hsl(0_72%_51%/0.06)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-[hsl(0,72%,65%)]" />
              <span className="text-sm font-medium text-[hsl(0,72%,65%)]">
                Active with No Gates ({activeNoGates.length})
              </span>
            </div>
            <div className="space-y-1">
              {activeNoGates.map((r) => (
                <div key={r.feature_id} className="text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="font-mono">{r.feature_id}</span> {r.title}
                </div>
              ))}
            </div>
          </div>
        )}
        {weakCoverage.length > 0 && (
          <div className="rounded-lg border border-[hsl(38_90%_50%/0.25)] bg-[hsl(38_90%_50%/0.06)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[hsl(38,90%,65%)]" />
              <span className="text-sm font-medium text-[hsl(38,90%,65%)]">
                Weak Gate Coverage ({weakCoverage.length})
              </span>
            </div>
            <div className="space-y-1">
              {weakCoverage.map((r) => (
                <div key={r.feature_id} className="text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="font-mono">{r.feature_id}</span> {r.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GateCoverageCard({ record }: { record: CapabilityRecord }) {
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
            label={`gates: ${record.gateHealth}`}
            tone={badgeToneForHealth(record.gateHealth)}
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

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <MetricChip
          count={record.gateCount}
          label="gates"
          tone={record.gateCount > 0 ? "cyan" : "red"}
        />
        {record.gates.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {record.gates.map((gate) => (
              <span
                key={gate}
                className="inline-flex items-center rounded-md bg-[hsl(186_80%_48%/0.08)] text-[hsl(186,80%,62%)] px-2 py-0.5 text-[11px] font-mono"
              >
                {gate}
              </span>
            ))}
          </div>
        )}
      </div>

      {record.attentionFlags.includes("active_without_gates") && (
        <div className="mt-2">
          <WarningPill
            message="Active with no gates defined"
            severity="high"
            compact
          />
        </div>
      )}
    </button>
  );
}

export function GatesPanel({ records, onReset }: GatesPanelProps) {
  const summary = computeGateSummary(records);

  if (records.length === 0) {
    return <CapabilitiesEmptyState message="No capabilities match the current filters." onReset={onReset} />;
  }

  return (
    <div className="space-y-6">
      <GateSummaryStrip summary={summary} />
      <GateWarningsPanel records={records} />
      <div>
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">
          Gate Coverage ({records.length})
        </h3>
        <div className="grid gap-3">
          {records.map((record) => (
            <GateCoverageCard key={record.feature_id} record={record} />
          ))}
        </div>
      </div>
    </div>
  );
}
