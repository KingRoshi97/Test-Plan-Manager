import { ReactNode } from "react";
import {
  Monitor,
  Loader2,
  Clock,
  AlertTriangle,
  Timer,
  WifiOff,
  ExternalLink,
} from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";

type PreviewStateVariant =
  | "none"
  | "building"
  | "preparing"
  | "failed"
  | "expired"
  | "loadError"
  | "nonEmbeddable";

interface PreviewStateCardProps {
  variant: PreviewStateVariant;
  title: string;
  description: string;
  actions?: ReactNode;
}

const iconMap: Record<PreviewStateVariant, typeof Monitor> = {
  none: Monitor,
  building: Loader2,
  preparing: Clock,
  failed: AlertTriangle,
  expired: Timer,
  loadError: WifiOff,
  nonEmbeddable: ExternalLink,
};

const glowMap: Record<PreviewStateVariant, "none" | "cyan" | "amber" | "red" | "violet"> = {
  none: "none",
  building: "cyan",
  preparing: "amber",
  failed: "red",
  expired: "violet",
  loadError: "red",
  nonEmbeddable: "amber",
};

const iconColorMap: Record<PreviewStateVariant, string> = {
  none: "text-[hsl(var(--muted-foreground))]",
  building: "text-[hsl(var(--status-processing))]",
  preparing: "text-[hsl(var(--status-warning))]",
  failed: "text-[hsl(var(--status-failure))]",
  expired: "text-[hsl(var(--status-intelligence))]",
  loadError: "text-[hsl(var(--status-failure))]",
  nonEmbeddable: "text-[hsl(var(--status-warning))]",
};

export function PreviewStateCard({ variant, title, description, actions }: PreviewStateCardProps) {
  const Icon = iconMap[variant];
  const glow = glowMap[variant];
  const iconColor = iconColorMap[variant];
  const isAnimated = variant === "building";

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <GlassPanel glow={glow} solid className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Icon
            className={`w-12 h-12 ${iconColor} ${isAnimated ? "animate-spin" : ""}`}
          />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
          {title}
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          {description}
        </p>
        {actions && (
          <div className="flex items-center justify-center gap-3">
            {actions}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
