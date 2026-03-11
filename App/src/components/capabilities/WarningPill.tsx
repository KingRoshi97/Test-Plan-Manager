import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export type WarningSeverity = "critical" | "high" | "moderate" | "info";

interface WarningPillProps {
  message: string;
  severity?: WarningSeverity;
  compact?: boolean;
}

const severityStyles: Record<
  WarningSeverity,
  { bg: string; text: string; icon: typeof AlertTriangle }
> = {
  critical: {
    bg: "bg-[hsl(0_72%_51%/0.10)] border-[hsl(0_72%_51%/0.25)]",
    text: "text-[hsl(0,72%,65%)]",
    icon: AlertCircle,
  },
  high: {
    bg: "bg-[hsl(0_72%_51%/0.08)] border-[hsl(0_72%_51%/0.18)]",
    text: "text-[hsl(0,72%,65%)]",
    icon: AlertTriangle,
  },
  moderate: {
    bg: "bg-[hsl(38_90%_50%/0.08)] border-[hsl(38_90%_50%/0.18)]",
    text: "text-[hsl(38,90%,65%)]",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-[hsl(217_91%_60%/0.08)] border-[hsl(217_91%_60%/0.18)]",
    text: "text-[hsl(217,91%,72%)]",
    icon: Info,
  },
};

export function WarningPill({
  message,
  severity = "moderate",
  compact = false,
}: WarningPillProps) {
  const s = severityStyles[severity];
  const Icon = s.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}
        title={message}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[180px]">{message}</span>
      </span>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${s.bg} ${s.text}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
