export type BadgeTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "cyan"
  | "gray";

export type BadgeKind =
  | "category"
  | "registry"
  | "implementation"
  | "risk"
  | "health";

interface CapabilityBadgeProps {
  label: string;
  tone: BadgeTone;
  kind?: BadgeKind;
  size?: "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
}

const toneStyles: Record<BadgeTone, { bg: string; text: string; dot: string }> = {
  green: {
    bg: "bg-[hsl(145_65%_48%/0.12)]",
    text: "text-[hsl(145,65%,60%)]",
    dot: "bg-[hsl(145,65%,48%)]",
  },
  amber: {
    bg: "bg-[hsl(38_90%_50%/0.12)]",
    text: "text-[hsl(38,90%,65%)]",
    dot: "bg-[hsl(38,90%,50%)]",
  },
  red: {
    bg: "bg-[hsl(0_72%_51%/0.12)]",
    text: "text-[hsl(0,72%,65%)]",
    dot: "bg-[hsl(0,72%,51%)]",
  },
  blue: {
    bg: "bg-[hsl(217_91%_60%/0.12)]",
    text: "text-[hsl(217,91%,72%)]",
    dot: "bg-[hsl(217,91%,60%)]",
  },
  violet: {
    bg: "bg-[hsl(270_70%_55%/0.12)]",
    text: "text-[hsl(270,70%,72%)]",
    dot: "bg-[hsl(270,70%,55%)]",
  },
  cyan: {
    bg: "bg-[hsl(186_80%_48%/0.12)]",
    text: "text-[hsl(186,80%,62%)]",
    dot: "bg-[hsl(186,80%,48%)]",
  },
  gray: {
    bg: "bg-[hsl(var(--muted))]",
    text: "text-[hsl(var(--muted-foreground))]",
    dot: "bg-[hsl(var(--muted-foreground))]",
  },
};

export function badgeToneForCategory(category: string): BadgeTone {
  switch (category) {
    case "infrastructure":
      return "violet";
    case "interface":
      return "blue";
    case "core-logic":
      return "amber";
    case "security":
      return "red";
    default:
      return "gray";
  }
}

export function badgeToneForRegistryStatus(status: string): BadgeTone {
  switch (status) {
    case "active":
      return "green";
    case "draft":
      return "amber";
    case "deprecated":
      return "gray";
    case "error":
      return "red";
    default:
      return "gray";
  }
}

export function badgeToneForImplementation(status: string): BadgeTone {
  switch (status) {
    case "implemented":
      return "green";
    case "partial":
      return "amber";
    case "stubbed":
      return "cyan";
    case "spec_only":
      return "blue";
    case "blocked":
      return "red";
    case "unverified":
      return "gray";
    default:
      return "gray";
  }
}

export function badgeToneForRisk(level: string): BadgeTone {
  switch (level) {
    case "low":
      return "green";
    case "moderate":
      return "amber";
    case "high":
      return "red";
    case "critical":
      return "red";
    default:
      return "gray";
  }
}

export function badgeToneForHealth(health: string): BadgeTone {
  switch (health) {
    case "healthy":
    case "linked":
    case "covered":
      return "green";
    case "warning":
    case "partial":
      return "amber";
    case "blocked":
    case "missing":
    case "failed":
      return "red";
    case "orphaned":
    case "stale":
      return "violet";
    default:
      return "gray";
  }
}

export function CapabilityBadge({
  label,
  tone,
  size = "sm",
  dot = false,
  pulse = false,
}: CapabilityBadgeProps) {
  const s = toneStyles[tone];
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${s.bg} ${s.text} ${sizeClasses}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${pulse ? "animate-pulse" : ""}`}
        />
      )}
      {label}
    </span>
  );
}
