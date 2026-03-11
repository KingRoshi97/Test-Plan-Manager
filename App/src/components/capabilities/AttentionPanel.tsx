import type { CapabilityRecord } from "../../types/capabilities";
import { AlertCircle, PackageX, ShieldOff, AlertTriangle } from "lucide-react";

interface AttentionPanelProps {
  records: CapabilityRecord[];
}

interface AttentionCardProps {
  title: string;
  count: number;
  items: string[];
  icon: React.ReactNode;
  tone: string;
}

function AttentionCard({ title, count, items, icon, tone }: AttentionCardProps) {
  if (count === 0) return null;

  return (
    <div className={`rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 ${tone}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-[hsl(var(--card-foreground))]">{title}</span>
        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--foreground))] tabular-nums">
          {count}
        </span>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 5).map((item) => (
          <li key={item} className="text-xs text-[hsl(var(--muted-foreground))] truncate">
            {item}
          </li>
        ))}
        {items.length > 5 && (
          <li className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)] italic">
            +{items.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
}

export function AttentionPanel({ records }: AttentionPanelProps) {
  const blocked = records.filter((r) =>
    r.attentionFlags.includes("blocked_by_dependency")
  );
  const missingModules = records.filter((r) =>
    r.attentionFlags.includes("active_without_modules")
  );
  const missingGates = records.filter((r) =>
    r.attentionFlags.includes("active_without_gates")
  );
  const activeIncomplete = records.filter((r) =>
    r.attentionFlags.includes("active_but_incomplete")
  );

  const hasAny =
    blocked.length > 0 ||
    missingModules.length > 0 ||
    missingGates.length > 0 ||
    activeIncomplete.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
        Attention Required
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AttentionCard
          title="Blocked"
          count={blocked.length}
          items={blocked.map((r) => `${r.feature_id}: ${r.title}`)}
          icon={<AlertCircle className="w-4 h-4 text-[hsl(0,72%,65%)]" />}
          tone="border-l-2 border-l-[hsl(0,72%,51%)]"
        />
        <AttentionCard
          title="Missing Modules"
          count={missingModules.length}
          items={missingModules.map((r) => `${r.feature_id}: ${r.title}`)}
          icon={<PackageX className="w-4 h-4 text-[hsl(38,90%,65%)]" />}
          tone="border-l-2 border-l-[hsl(38,90%,50%)]"
        />
        <AttentionCard
          title="Missing Gates"
          count={missingGates.length}
          items={missingGates.map((r) => `${r.feature_id}: ${r.title}`)}
          icon={<ShieldOff className="w-4 h-4 text-[hsl(38,90%,65%)]" />}
          tone="border-l-2 border-l-[hsl(38,90%,50%)]"
        />
        <AttentionCard
          title="Active but Incomplete"
          count={activeIncomplete.length}
          items={activeIncomplete.map((r) => `${r.feature_id}: ${r.title}`)}
          icon={<AlertTriangle className="w-4 h-4 text-[hsl(270,70%,72%)]" />}
          tone="border-l-2 border-l-[hsl(270,70%,55%)]"
        />
      </div>
    </div>
  );
}
