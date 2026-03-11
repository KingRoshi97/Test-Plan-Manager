import { Play, Settings } from "lucide-react";
import { GlassPanel } from "../ui/glass-panel";
import { StatusChip } from "../ui/status-chip";
import type { MaintenanceModeCard, ControlState } from "../../data/library-control";

function stateVariant(state: ControlState) {
  switch (state) {
    case "governed": return "success" as const;
    case "review-required": return "warning" as const;
    case "degraded": return "warning" as const;
    case "blocked": return "failure" as const;
    case "unsafe": return "failure" as const;
    case "recovery": return "intelligence" as const;
  }
}

interface MaintenanceModesProps {
  modes: MaintenanceModeCard[];
  onLaunch?: (modeId: string) => void;
}

export function MaintenanceModes({ modes, onLaunch }: MaintenanceModesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-[hsl(var(--primary))]" />
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Maintenance Modes
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modes.map((mode) => (
          <GlassPanel key={mode.id} hover className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono-tech text-[10px] text-[hsl(var(--muted-foreground))]">
                  {mode.id}
                </span>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {mode.name}
                </h3>
              </div>
              {mode.launchable && (
                <button
                  onClick={() => onLaunch?.(mode.id)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Launch
                </button>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              {mode.purpose}
            </p>
            <div className="text-[10px] text-[hsl(var(--muted-foreground)/0.7)] italic">
              {mode.triggerCondition}
            </div>
            <div className="flex flex-wrap gap-1">
              {mode.suggestedForStates.map((state) => (
                <StatusChip
                  key={state}
                  variant={stateVariant(state)}
                  label={state}
                  size="sm"
                />
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
