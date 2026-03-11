import type { BadgeTone } from "./CapabilityBadge";

interface MetricChipProps {
  count: number;
  label: string;
  tone?: BadgeTone;
  size?: "sm" | "md";
}

const toneBg: Record<BadgeTone, string> = {
  green: "bg-[hsl(145_65%_48%/0.08)] text-[hsl(145,65%,60%)]",
  amber: "bg-[hsl(38_90%_50%/0.08)] text-[hsl(38,90%,65%)]",
  red: "bg-[hsl(0_72%_51%/0.08)] text-[hsl(0,72%,65%)]",
  blue: "bg-[hsl(217_91%_60%/0.08)] text-[hsl(217,91%,72%)]",
  violet: "bg-[hsl(270_70%_55%/0.08)] text-[hsl(270,70%,72%)]",
  cyan: "bg-[hsl(186_80%_48%/0.08)] text-[hsl(186,80%,62%)]",
  gray: "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]",
};

export function MetricChip({
  count,
  label,
  tone = "gray",
  size = "sm",
}: MetricChipProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium tabular-nums whitespace-nowrap ${toneBg[tone]} ${sizeClasses}`}
    >
      <span className="font-semibold">{count}</span>
      <span className="opacity-75">{label}</span>
    </span>
  );
}
