import type { CapabilityRecord, CapabilityStats } from "../../../types/capabilities";
import { AttentionPanel } from "../AttentionPanel";
import { CoverageCalloutRow } from "../CoverageCalloutRow";
import { CapabilityBoard } from "../CapabilityBoard";

interface OverviewPanelProps {
  records: CapabilityRecord[];
  filtered: CapabilityRecord[];
  stats: CapabilityStats;
  onReset?: () => void;
}

export function OverviewPanel({
  records,
  filtered,
  stats,
  onReset,
}: OverviewPanelProps) {
  return (
    <div className="space-y-6">
      <AttentionPanel records={records} />
      <CoverageCalloutRow stats={stats} />
      <CapabilityBoard
        records={filtered}
        onReset={onReset}
        emptyMessage="No capabilities match the current filters."
      />
    </div>
  );
}
