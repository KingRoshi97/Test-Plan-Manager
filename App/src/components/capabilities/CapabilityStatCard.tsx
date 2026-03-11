import type { BadgeTone } from "./CapabilityBadge";

interface CapabilityStatCardProps {
  label: string;
  value: number;
  tone: BadgeTone;
}

const toneStyles: Record<BadgeTone, { bg: string; value: string; label: string }> = {
  green: {
    bg: "bg-[hsl(145_65%_48%/0.08)] border-[hsl(145_65%_48%/0.2)]",
    value: "text-[hsl(145,65%,60%)]",
    label: "text-[hsl(145,65%,48%/0.7)]",
  },
  amber: {
    bg: "bg-[hsl(38_90%_50%/0.08)] border-[hsl(38_90%_50%/0.2)]",
    value: "text-[hsl(38,90%,65%)]",
    label: "text-[hsl(38,90%,50%/0.7)]",
  },
  red: {
    bg: "bg-[hsl(0_72%_51%/0.08)] border-[hsl(0_72%_51%/0.2)]",
    value: "text-[hsl(0,72%,65%)]",
    label: "text-[hsl(0,72%,51%/0.7)]",
  },
  blue: {
    bg: "bg-[hsl(217_91%_60%/0.08)] border-[hsl(217_91%_60%/0.2)]",
    value: "text-[hsl(217,91%,72%)]",
    label: "text-[hsl(217,91%,60%/0.7)]",
  },
  violet: {
    bg: "bg-[hsl(270_70%_55%/0.08)] border-[hsl(270_70%_55%/0.2)]",
    value: "text-[hsl(270,70%,72%)]",
    label: "text-[hsl(270,70%,55%/0.7)]",
  },
  cyan: {
    bg: "bg-[hsl(186_80%_48%/0.08)] border-[hsl(186_80%_48%/0.2)]",
    value: "text-[hsl(186,80%,62%)]",
    label: "text-[hsl(186,80%,48%/0.7)]",
  },
  gray: {
    bg: "bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))]",
    value: "text-[hsl(var(--foreground))]",
    label: "text-[hsl(var(--muted-foreground))]",
  },
};

export function CapabilityStatCard({ label, value, tone }: CapabilityStatCardProps) {
  const s = toneStyles[tone];

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-center ${s.bg}`}
    >
      <div className={`text-xl font-bold tabular-nums ${s.value}`}>{value}</div>
      <div className={`text-[11px] font-medium ${s.label}`}>{label}</div>
    </div>
  );
}
