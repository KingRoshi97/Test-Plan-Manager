import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Puzzle,
  ShieldOff,
} from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { StatusChip, type StatusVariant } from "../ui/status-chip";
import type { LibraryHealthBand, HealthBandId } from "../../data/library-control";

const bandConfig: Record<
  HealthBandId,
  { icon: typeof Shield; accent: StatusVariant; glow: "cyan" | "green" | "amber" | "red" | "violet" | "none" }
> = {
  authoritative: { icon: Shield, accent: "success", glow: "green" },
  stable: { icon: CheckCircle2, accent: "processing", glow: "cyan" },
  incomplete: { icon: AlertTriangle, accent: "warning", glow: "amber" },
  stale: { icon: Clock, accent: "warning", glow: "amber" },
  fragmented: { icon: Puzzle, accent: "failure", glow: "red" },
  untrusted: { icon: ShieldOff, accent: "failure", glow: "red" },
};

interface HealthOverviewProps {
  healthBands: LibraryHealthBand[];
  onBandClick?: (bandId: HealthBandId) => void;
}

export function HealthOverview({ healthBands, onBandClick }: HealthOverviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
        Library Health Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {healthBands.map((band) => {
          const config = bandConfig[band.id];
          const Icon = config.icon;
          return (
            <GlassPanel
              key={band.id}
              glow={band.count > 0 ? config.glow : "none"}
              hover
              onClick={onBandClick ? () => onBandClick(band.id) : undefined}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 text-[hsl(var(--status-${config.accent === "success" ? "success" : config.accent === "processing" ? "processing" : config.accent === "warning" ? "warning" : "failure"}))]`} />
                <span className="text-2xl font-bold tabular-nums text-[hsl(var(--foreground))]">
                  {band.count}
                </span>
              </div>
              <div>
                <StatusChip variant={config.accent} label={band.label} size="sm" />
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">
                {band.libraryIds.length > 0
                  ? band.libraryIds.join(", ")
                  : "No libraries"}
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground)/0.7)] italic leading-tight">
                {band.recommendedAction}
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
