import { useState } from "react";

const STAGES = [
  { key: "S1_INGEST_NORMALIZE", label: "Ingest & Normalize", gate: null },
  { key: "S2_VALIDATE_INTAKE", label: "Validate Intake", gate: "G1_INTAKE_VALIDITY" },
  { key: "S3_BUILD_CANONICAL", label: "Build Canonical", gate: null },
  { key: "S4_VALIDATE_CANONICAL", label: "Validate Canonical", gate: "G2_CANONICAL_INTEGRITY" },
  { key: "S5_RESOLVE_STANDARDS", label: "Resolve Standards", gate: "G3_STANDARDS_RESOLVED" },
  { key: "S6_SELECT_TEMPLATES", label: "Select Templates", gate: "G4_TEMPLATE_SELECTION" },
  { key: "S7_RENDER_DOCS", label: "Render Docs", gate: "G5_TEMPLATE_COMPLETENESS" },
  { key: "S8_BUILD_PLAN", label: "Build Plan", gate: "G6_PLAN_COVERAGE" },
  { key: "S9_VERIFY_PROOF", label: "Verify Proof", gate: null },
  { key: "S10_PACKAGE", label: "Package", gate: "G8_PACKAGE_INTEGRITY" },
];

function stageStatusColor(status: string) {
  switch (status) {
    case "passed":
    case "completed":
      return { bg: "bg-green-500", border: "border-green-500", text: "text-green-700" };
    case "failed":
      return { bg: "bg-red-500", border: "border-red-500", text: "text-red-700" };
    case "running":
      return { bg: "bg-blue-500 animate-pulse", border: "border-blue-500", text: "text-blue-700" };
    default:
      return { bg: "bg-gray-300", border: "border-gray-300", text: "text-gray-500" };
  }
}

export function PipelineProgress({
  stages,
  size = "sm",
}: {
  stages: Record<string, any> | null;
  size?: "sm" | "md";
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dotSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const lineH = size === "sm" ? "h-0.5" : "h-0.5";

  return (
    <div className="relative inline-flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const stageData = stages?.[stage.key];
        const status = stageData?.status || "pending";
        const colors = stageStatusColor(status);

        return (
          <div key={stage.key} className="flex items-center">
            <div
              className="relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`${dotSize} rounded-full ${colors.bg} border ${colors.border} cursor-default`}
              />
              {hoveredIndex === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                  <div className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs rounded-md px-2.5 py-1.5 shadow-lg border border-[hsl(var(--border))] whitespace-nowrap">
                    <div className="font-medium">{stage.label}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`capitalize ${colors.text}`}>{status}</span>
                      {stage.gate && (
                        <span className="text-[hsl(var(--muted-foreground))]">{stage.gate}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`w-2 ${lineH} ${
                  status === "passed" || status === "completed"
                    ? "bg-green-400"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STAGES };
