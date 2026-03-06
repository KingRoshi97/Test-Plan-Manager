import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

type MetricAccent = "cyan" | "green" | "amber" | "red" | "violet" | "default";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: MetricAccent;
  subtitle?: string;
  onClick?: () => void;
}

const accentColors: Record<MetricAccent, { icon: string; value: string; border: string }> = {
  cyan: {
    icon: "text-[hsl(var(--status-processing))]",
    value: "text-[hsl(var(--status-processing))]",
    border: "hover:border-[hsl(var(--status-processing)/0.3)]",
  },
  green: {
    icon: "text-[hsl(var(--status-success))]",
    value: "text-[hsl(var(--status-success))]",
    border: "hover:border-[hsl(var(--status-success)/0.3)]",
  },
  amber: {
    icon: "text-[hsl(var(--status-warning))]",
    value: "text-[hsl(var(--status-warning))]",
    border: "hover:border-[hsl(var(--status-warning)/0.3)]",
  },
  red: {
    icon: "text-[hsl(var(--status-failure))]",
    value: "text-[hsl(var(--status-failure))]",
    border: "hover:border-[hsl(var(--status-failure)/0.3)]",
  },
  violet: {
    icon: "text-[hsl(var(--status-intelligence))]",
    value: "text-[hsl(var(--status-intelligence))]",
    border: "hover:border-[hsl(var(--status-intelligence)/0.3)]",
  },
  default: {
    icon: "text-[hsl(var(--muted-foreground))]",
    value: "text-[hsl(var(--foreground))]",
    border: "hover:border-[hsl(var(--primary)/0.3)]",
  },
};

export function MetricCard({ icon: Icon, label, value, accent = "default", subtitle, onClick }: MetricCardProps) {
  const colors = accentColors[accent];
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      className={`glass-panel-solid p-4 transition-all duration-200 ${colors.border} ${onClick ? "cursor-pointer" : ""} text-left w-full`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <span className="text-system-label">{label}</span>
      </div>
      <div className={`text-2xl font-semibold tabular-nums ${colors.value}`}>{value}</div>
      {subtitle && (
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{subtitle}</div>
      )}
    </Comp>
  );
}
