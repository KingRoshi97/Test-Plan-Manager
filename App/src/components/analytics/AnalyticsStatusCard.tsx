import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { AnalyticsCardResponse } from "../../../../shared/analytics/card-registry";

interface AnalyticsStatusCardProps {
  card: AnalyticsCardResponse;
  onClick?: () => void;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "ok": return <CheckCircle className="w-5 h-5 text-[hsl(var(--status-success))]" />;
    case "warn": return <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-warning))]" />;
    case "fail": return <XCircle className="w-5 h-5 text-[hsl(var(--status-failure))]" />;
    default: return <HelpCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />;
  }
}

function getStatusLabel(status?: string, value?: number | string | boolean | null | Array<Record<string, unknown>>): string {
  if (typeof value === "number" && value >= 90) return "Healthy";
  if (typeof value === "number" && value >= 70) return "Degraded";
  if (typeof value === "number" && value < 70) return "Critical";

  switch (status) {
    case "ok": return "Operational";
    case "warn": return "Degraded";
    case "fail": return "Critical";
    default: return "Unknown";
  }
}

export function AnalyticsStatusCard({ card, onClick }: AnalyticsStatusCardProps) {
  const Comp = onClick ? "button" : "div";
  const statusForIcon = typeof card.value === "number"
    ? card.value >= 90 ? "ok" : card.value >= 70 ? "warn" : "fail"
    : card.status;

  return (
    <Comp
      onClick={onClick}
      className={`glass-panel-solid p-4 transition-all duration-200 text-left w-full hover:border-[hsl(var(--primary)/0.3)] ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-system-label text-xs uppercase tracking-wider">{card.title}</span>
        {getStatusIcon(statusForIcon)}
      </div>
      <div className="text-lg font-semibold mt-2">
        {getStatusLabel(statusForIcon, card.value)}
      </div>
      {typeof card.value === "number" && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{card.value}% health score</div>
      )}
    </Comp>
  );
}
