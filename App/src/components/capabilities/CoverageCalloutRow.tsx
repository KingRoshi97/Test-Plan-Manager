import type { CapabilityStats } from "../../types/capabilities";
import { PackageX, ShieldOff, AlertTriangle, Zap } from "lucide-react";

interface CoverageCalloutRowProps {
  stats: CapabilityStats;
}

interface CalloutCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  tone: string;
}

function CalloutCard({ label, count, icon, tone }: CalloutCardProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 ${tone}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-[hsl(var(--card-foreground))] tabular-nums leading-tight">
          {count}
        </span>
        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
          {label}
        </span>
      </div>
    </div>
  );
}

export function CoverageCalloutRow({ stats }: CoverageCalloutRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <CalloutCard
        label="Missing Modules"
        count={stats.missingModules}
        icon={<PackageX className="w-5 h-5 text-[hsl(38,90%,65%)]" />}
        tone=""
      />
      <CalloutCard
        label="Missing Gates"
        count={stats.missingGates}
        icon={<ShieldOff className="w-5 h-5 text-[hsl(38,90%,65%)]" />}
        tone=""
      />
      <CalloutCard
        label="Active Incomplete"
        count={stats.partial + stats.stubbed}
        icon={<AlertTriangle className="w-5 h-5 text-[hsl(270,70%,72%)]" />}
        tone=""
      />
      <CalloutCard
        label="High Risk"
        count={stats.highRisk}
        icon={<Zap className="w-5 h-5 text-[hsl(0,72%,65%)]" />}
        tone=""
      />
    </div>
  );
}
