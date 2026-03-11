import type { CapabilityRecord } from "../../types/capabilities";
import { CapabilityCard } from "./CapabilityCard";
import { CapabilitiesEmptyState } from "./CapabilitiesEmptyState";

interface CapabilityBoardProps {
  records: CapabilityRecord[];
  onReset?: () => void;
  emptyMessage?: string;
}

export function CapabilityBoard({
  records,
  onReset,
  emptyMessage,
}: CapabilityBoardProps) {
  if (records.length === 0) {
    return <CapabilitiesEmptyState message={emptyMessage} onReset={onReset} />;
  }

  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <CapabilityCard key={record.feature_id} record={record} />
      ))}
    </div>
  );
}
