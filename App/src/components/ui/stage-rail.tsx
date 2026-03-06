type StageStatus = "completed" | "active" | "failed" | "pending" | "skipped";

interface StageInfo {
  label: string;
  status: StageStatus;
}

interface StageRailProps {
  stages: StageInfo[];
  size?: "sm" | "md";
  showLabels?: boolean;
}

const statusColors: Record<StageStatus, { bg: string; ring: string }> = {
  completed: {
    bg: "bg-[hsl(var(--status-success))]",
    ring: "",
  },
  active: {
    bg: "bg-[hsl(var(--status-processing))]",
    ring: "ring-2 ring-[hsl(var(--status-processing)/0.4)]",
  },
  failed: {
    bg: "bg-[hsl(var(--status-failure))]",
    ring: "ring-2 ring-[hsl(var(--status-failure)/0.4)]",
  },
  pending: {
    bg: "bg-[hsl(var(--muted-foreground)/0.25)]",
    ring: "",
  },
  skipped: {
    bg: "bg-[hsl(var(--muted-foreground)/0.15)]",
    ring: "",
  },
};

const STAGE_NAMES = [
  "S1 DISCOVER",
  "S2 ANALYZE",
  "S3 BLUEPRINT",
  "S4 VALIDATE",
  "S5 COMPLIANCE",
  "S6 TEMPLATES",
  "S7 GENERATE",
  "S8 VERIFY",
  "S9 ASSEMBLE",
  "S10 EXPORT",
];

export function StageRail({ stages, size = "sm", showLabels = false }: StageRailProps) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  const connectorH = size === "sm" ? "h-[2px]" : "h-[3px]";

  return (
    <div className="flex items-center gap-0.5">
      {stages.map((stage, i) => {
        const colors = statusColors[stage.status];
        return (
          <div key={i} className="flex items-center">
            <div className="relative group">
              <div
                className={`${dotSize} rounded-full ${colors.bg} ${colors.ring} ${
                  stage.status === "active" ? "animate-pulse-glow" : ""
                }`}
              />
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div className="whitespace-nowrap px-2 py-1 rounded text-[10px] font-medium bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow-lg">
                  {stage.label}
                </div>
              </div>
            </div>
            {i < stages.length - 1 && (
              <div
                className={`w-2 ${connectorH} ${
                  stage.status === "completed"
                    ? "bg-[hsl(var(--status-success)/0.4)]"
                    : "bg-[hsl(var(--muted-foreground)/0.15)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function parseStagesFromAssembly(latestStages: any): StageInfo[] {
  if (!latestStages || !Array.isArray(latestStages)) {
    return STAGE_NAMES.map((label) => ({ label, status: "pending" as StageStatus }));
  }

  return STAGE_NAMES.map((label, i) => {
    const stageData = latestStages[i];
    if (!stageData) return { label, status: "pending" as StageStatus };

    const s = stageData.status || stageData;
    if (typeof s === "string") {
      if (s === "completed" || s === "done" || s === "passed") return { label, status: "completed" as StageStatus };
      if (s === "running" || s === "active" || s === "in_progress") return { label, status: "active" as StageStatus };
      if (s === "failed" || s === "error") return { label, status: "failed" as StageStatus };
      if (s === "skipped") return { label, status: "skipped" as StageStatus };
    }
    return { label, status: "pending" as StageStatus };
  });
}

export { STAGE_NAMES };
export type { StageInfo, StageStatus };
