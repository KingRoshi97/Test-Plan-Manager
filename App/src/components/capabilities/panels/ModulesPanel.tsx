import type { CapabilityRecord } from "../../../types/capabilities";
import {
  CapabilityBadge,
  badgeToneForHealth,
} from "../CapabilityBadge";
import { MetricChip } from "../MetricChip";
import { WarningPill } from "../WarningPill";
import { CapabilitiesEmptyState } from "../CapabilitiesEmptyState";
import { Boxes, PackageCheck, PackageX } from "lucide-react";

interface ModulesPanelProps {
  records: CapabilityRecord[];
  onReset?: () => void;
}

function ModuleSummaryStrip({ records }: { records: CapabilityRecord[] }) {
  const linked = records.filter((r) => r.moduleHealth === "linked").length;
  const partial = records.filter((r) => r.moduleHealth === "partial").length;
  const missing = records.filter((r) => r.moduleHealth === "missing").length;
  const orphaned = records.filter((r) => r.moduleHealth === "orphaned").length;
  const stale = records.filter((r) => r.moduleHealth === "stale").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {[
        { label: "Linked", value: linked, tone: "green" as const },
        { label: "Partial", value: partial, tone: "amber" as const },
        { label: "Missing", value: missing, tone: "red" as const },
        { label: "Orphaned", value: orphaned, tone: "violet" as const },
        { label: "Stale", value: stale, tone: "gray" as const },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-center"
        >
          <div className={`text-2xl font-bold tabular-nums text-[hsl(var(--card-foreground))]`}>
            {item.value}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            <CapabilityBadge label={item.label} tone={item.tone} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleWarningsPanel({ records }: { records: CapabilityRecord[] }) {
  const activeNoModules = records.filter(
    (r) => r.registryStatus === "active" && r.moduleCount === 0
  );
  const activeIncomplete = records.filter(
    (r) =>
      r.registryStatus === "active" &&
      r.moduleHealth === "partial"
  );

  if (activeNoModules.length === 0 && activeIncomplete.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeNoModules.length > 0 && (
        <div className="rounded-lg border border-[hsl(0_72%_51%/0.18)] bg-[hsl(0_72%_51%/0.05)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <PackageX className="w-4 h-4 text-[hsl(0,72%,65%)]" />
            <span className="text-sm font-medium text-[hsl(0,72%,65%)]">
              Active with no linked source modules ({activeNoModules.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeNoModules.map((r) => (
              <WarningPill
                key={r.feature_id}
                message={`${r.feature_id}: ${r.title}`}
                severity="high"
                compact
              />
            ))}
          </div>
        </div>
      )}
      {activeIncomplete.length > 0 && (
        <div className="rounded-lg border border-[hsl(38_90%_50%/0.18)] bg-[hsl(38_90%_50%/0.05)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <PackageCheck className="w-4 h-4 text-[hsl(38,90%,65%)]" />
            <span className="text-sm font-medium text-[hsl(38,90%,65%)]">
              Partial module coverage ({activeIncomplete.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeIncomplete.map((r) => (
              <WarningPill
                key={r.feature_id}
                message={`${r.feature_id}: ${r.title}`}
                severity="moderate"
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleCoverageCard({ record }: { record: CapabilityRecord }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Boxes className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0" />
          <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] shrink-0">
            {record.feature_id}
          </span>
          <span className="font-medium text-sm text-[hsl(var(--card-foreground))] truncate">
            {record.title}
          </span>
        </div>
        <CapabilityBadge
          label={record.moduleHealth}
          tone={badgeToneForHealth(record.moduleHealth)}
          kind="health"
          dot
        />
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <MetricChip
          count={record.moduleCount}
          label="modules"
          tone={record.moduleCount > 0 ? "blue" : "red"}
        />
      </div>

      {record.srcModules.length > 0 ? (
        <div className="mt-3 space-y-1">
          <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            Linked Modules
          </span>
          <div className="flex flex-wrap gap-1">
            {record.srcModules.map((mod) => (
              <span
                key={mod}
                className="inline-flex items-center rounded-md bg-[hsl(217_91%_60%/0.08)] text-[hsl(217,91%,72%)] px-2 py-0.5 text-[11px] font-mono"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <span className="text-[11px] text-[hsl(var(--muted-foreground))] italic">
            No source modules linked
          </span>
        </div>
      )}

      {record.attentionFlags.includes("active_without_modules") && (
        <div className="mt-2">
          <WarningPill
            message="Marked active but has no linked source modules"
            severity="high"
            compact
          />
        </div>
      )}
    </div>
  );
}

export function ModulesPanel({ records, onReset }: ModulesPanelProps) {
  if (records.length === 0) {
    return (
      <CapabilitiesEmptyState
        message="No capabilities match the current filters."
        onReset={onReset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ModuleSummaryStrip records={records} />
      <ModuleWarningsPanel records={records} />
      <div className="grid gap-3">
        {records.map((record) => (
          <ModuleCoverageCard key={record.feature_id} record={record} />
        ))}
      </div>
    </div>
  );
}
