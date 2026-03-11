import type { CapabilityStats } from "../../types/capabilities";
import { CapabilityStatCard } from "./CapabilityStatCard";

interface CapabilityStatStripProps {
  stats: CapabilityStats;
}

export function CapabilityStatStrip({ stats }: CapabilityStatStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <CapabilityStatCard label="Total" value={stats.total} tone="gray" />
      <CapabilityStatCard label="Implemented" value={stats.implemented} tone="green" />
      <CapabilityStatCard label="Partial" value={stats.partial} tone="amber" />
      <CapabilityStatCard label="Blocked" value={stats.blocked} tone="red" />
      <CapabilityStatCard label="Unverified" value={stats.unverified} tone="cyan" />
      <CapabilityStatCard label="High Risk" value={stats.highRisk} tone="red" />
    </div>
  );
}
