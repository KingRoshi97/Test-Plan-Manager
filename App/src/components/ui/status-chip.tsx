type StatusVariant = "processing" | "success" | "warning" | "failure" | "intelligence" | "neutral";

interface StatusChipProps {
  variant: StatusVariant;
  label: string;
  pulse?: boolean;
  size?: "sm" | "md";
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
  processing: {
    bg: "bg-[hsl(var(--status-processing)/0.12)]",
    text: "text-[hsl(var(--status-processing))]",
    dot: "bg-[hsl(var(--status-processing))]",
  },
  success: {
    bg: "bg-[hsl(var(--status-success)/0.12)]",
    text: "text-[hsl(var(--status-success))]",
    dot: "bg-[hsl(var(--status-success))]",
  },
  warning: {
    bg: "bg-[hsl(var(--status-warning)/0.12)]",
    text: "text-[hsl(var(--status-warning))]",
    dot: "bg-[hsl(var(--status-warning))]",
  },
  failure: {
    bg: "bg-[hsl(var(--status-failure)/0.12)]",
    text: "text-[hsl(var(--status-failure))]",
    dot: "bg-[hsl(var(--status-failure))]",
  },
  intelligence: {
    bg: "bg-[hsl(var(--status-intelligence)/0.12)]",
    text: "text-[hsl(var(--status-intelligence))]",
    dot: "bg-[hsl(var(--status-intelligence))]",
  },
  neutral: {
    bg: "bg-[hsl(var(--muted))]",
    text: "text-[hsl(var(--muted-foreground))]",
    dot: "bg-[hsl(var(--muted-foreground))]",
  },
};

export function StatusChip({ variant, label, pulse = false, size = "sm" }: StatusChipProps) {
  const s = variantStyles[variant];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.bg} ${s.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${pulse ? "animate-pulse-glow" : ""}`} />
      {label}
    </span>
  );
}

export function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "running": return "processing";
    case "completed": return "success";
    case "failed": return "failure";
    case "queued": return "neutral";
    default: return "neutral";
  }
}
