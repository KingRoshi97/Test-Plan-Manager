import { TrendingUp, TrendingDown, Minus, ExternalLink, AlertTriangle, Clock } from "lucide-react";
import type { AnalyticsCardResponse } from "../../../../shared/analytics/card-registry";

interface AnalyticsStatCardProps {
  card: AnalyticsCardResponse;
  onClick?: () => void;
}

function getStatusColor(status?: string): string {
  switch (status) {
    case "ok": return "text-[hsl(var(--status-success))]";
    case "warn": return "text-[hsl(var(--status-warning))]";
    case "fail": return "text-[hsl(var(--status-failure))]";
    default: return "text-[hsl(var(--foreground))]";
  }
}

function getStatusBorder(status?: string): string {
  switch (status) {
    case "ok": return "border-[hsl(var(--status-success)/0.15)]";
    case "warn": return "border-[hsl(var(--status-warning)/0.15)]";
    case "fail": return "border-[hsl(var(--status-failure)/0.15)]";
    default: return "";
  }
}

function formatCardValue(value: number | string | boolean | null | Array<Record<string, unknown>>, unit?: string, precision?: number): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === "string") return value;

  const num = Number(value);
  if (isNaN(num)) return String(value);

  if (unit === "percent") return `${num.toFixed(precision ?? 1)}%`;
  if (unit === "ms") {
    if (num < 1000) return `${Math.round(num)}ms`;
    if (num < 60000) return `${(num / 1000).toFixed(1)}s`;
    return `${(num / 60000).toFixed(1)}m`;
  }
  if (unit === "seconds") return `${num.toFixed(precision ?? 1)}s`;
  if (unit === "minutes") return `${num.toFixed(precision ?? 1)}m`;
  if (unit === "tokens") return num.toLocaleString();
  if (unit === "score") return `${num}%`;

  if (precision !== undefined) return num.toFixed(precision);
  return num.toLocaleString();
}

export function AnalyticsStatCard({ card, onClick }: AnalyticsStatCardProps) {
  const isError = card.state === "error";
  const isStale = card.state === "stale";
  const isEmpty = card.state === "empty";
  const isDisabled = card.state === "disabled";

  if (isDisabled) {
    return (
      <div className="glass-panel-solid p-4 opacity-50">
        <div className="text-system-label text-sm">{card.title}</div>
        <div className="text-lg text-[hsl(var(--muted-foreground))] mt-1">Disabled</div>
      </div>
    );
  }

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      className={`glass-panel-solid p-4 transition-all duration-200 text-left w-full hover:border-[hsl(var(--primary)/0.3)] ${getStatusBorder(card.status)} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-system-label text-xs uppercase tracking-wider">{card.title}</span>
        <div className="flex items-center gap-1">
          {isStale && <Clock className="w-3 h-3 text-[hsl(var(--status-warning))]" />}
          {isError && <AlertTriangle className="w-3 h-3 text-[hsl(var(--status-failure))]" />}
          {card.drilldown_target && onClick && (
            <ExternalLink className="w-3 h-3 text-[hsl(var(--muted-foreground)/0.5)]" />
          )}
        </div>
      </div>

      {card.subtitle && (
        <div className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] mb-1">{card.subtitle}</div>
      )}

      <div className={`text-2xl font-semibold tabular-nums mt-1 ${isError ? "text-[hsl(var(--status-failure))]" : isEmpty ? "text-[hsl(var(--muted-foreground))]" : getStatusColor(card.status)}`}>
        {isError ? "Error" : isEmpty ? "—" : formatCardValue(card.value, card.unit, card.precision)}
      </div>

      {card.secondary_value && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{card.secondary_value}</div>
      )}

      {card.delta && (
        <div className="flex items-center gap-1 mt-1">
          {card.delta.direction === "up" && <TrendingUp className="w-3 h-3 text-[hsl(var(--status-success))]" />}
          {card.delta.direction === "down" && <TrendingDown className="w-3 h-3 text-[hsl(var(--status-failure))]" />}
          {card.delta.direction === "flat" && <Minus className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />}
          {card.delta.percent !== undefined && (
            <span className={`text-xs ${card.delta.direction === "up" ? "text-[hsl(var(--status-success))]" : card.delta.direction === "down" ? "text-[hsl(var(--status-failure))]" : "text-[hsl(var(--muted-foreground))]"}`}>
              {card.delta.percent > 0 ? "+" : ""}{card.delta.percent.toFixed(1)}%
            </span>
          )}
          {card.delta.compare_window && (
            <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.5)]">vs {card.delta.compare_window}</span>
          )}
        </div>
      )}

      {card.updated_at && (
        <div className="text-[10px] text-[hsl(var(--muted-foreground)/0.4)] mt-2">
          {isStale ? "⚠ Stale — " : ""}Updated {formatTimeAgo(new Date(card.updated_at))}
        </div>
      )}
    </Comp>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
