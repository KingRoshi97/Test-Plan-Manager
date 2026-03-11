import type { CapabilityRecord, ImplementationStatus } from "../../../types/capabilities";
import { CapabilityCardCompact } from "../CapabilityCardCompact";
import { badgeToneForImplementation } from "../CapabilityBadge";

interface ReadinessPanelProps {
  groupedByImplementation: Record<ImplementationStatus, CapabilityRecord[]>;
}

const lanes: { key: ImplementationStatus; label: string }[] = [
  { key: "implemented", label: "Implemented" },
  { key: "partial", label: "Partial" },
  { key: "stubbed", label: "Stubbed" },
  { key: "spec_only", label: "Spec Only" },
  { key: "blocked", label: "Blocked" },
  { key: "unverified", label: "Unverified" },
];

const laneDotColor: Record<ImplementationStatus, string> = {
  implemented: "bg-[hsl(145,65%,48%)]",
  partial: "bg-[hsl(38,90%,50%)]",
  stubbed: "bg-[hsl(186,80%,48%)]",
  spec_only: "bg-[hsl(217,91%,60%)]",
  blocked: "bg-[hsl(0,72%,51%)]",
  unverified: "bg-[hsl(var(--muted-foreground))]",
};

export function ReadinessPanel({ groupedByImplementation }: ReadinessPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {lanes.map(({ key, label }) => {
        const items = groupedByImplementation[key] ?? [];
        return (
          <div
            key={key}
            className="flex flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${laneDotColor[key]}`} />
                <span className="text-xs font-semibold text-[hsl(var(--card-foreground))]">
                  {label}
                </span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-2 min-h-[120px]">
              {items.length === 0 ? (
                <div className="flex items-center justify-center flex-1 text-[11px] text-[hsl(var(--muted-foreground))] italic">
                  None
                </div>
              ) : (
                items.map((record) => (
                  <CapabilityCardCompact key={record.feature_id} record={record} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
