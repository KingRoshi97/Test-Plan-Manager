import { cn } from "@/lib/utils";
import { Check, Loader2, Circle } from "lucide-react";

const PIPELINE_STEPS = [
  { id: "init", label: "Initialize", description: "Setting up workspace" },
  { id: "gen", label: "Generate", description: "AI documentation" },
  { id: "seed", label: "Seed", description: "Starter content" },
  { id: "draft", label: "Draft", description: "Extract from sources" },
  { id: "review", label: "Review", description: "Validate content" },
  { id: "verify", label: "Verify", description: "Check completeness" },
  { id: "lock", label: "Lock", description: "Finalize domain" },
  { id: "package", label: "Package", description: "Create kit" },
];

interface AssemblyTimelineProps {
  currentStep: string | null;
  state: "queued" | "running" | "completed" | "failed" | "canceled";
  className?: string;
  compact?: boolean;
}

export function AssemblyTimeline({ currentStep, state, className, compact = false }: AssemblyTimelineProps) {
  const currentIndex = currentStep ? PIPELINE_STEPS.findIndex(s => s.id === currentStep) : -1;
  const isComplete = state === "completed";
  const isFailed = state === "failed";

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "flex",
        compact ? "flex-row items-center gap-1" : "flex-col gap-0"
      )}>
        {PIPELINE_STEPS.map((step, index) => {
          const isStepComplete = isComplete || index < currentIndex;
          const isCurrentStep = !isComplete && step.id === currentStep;
          const isStepFailed = isFailed && isCurrentStep;
          const isPending = index > currentIndex && !isComplete;

          return (
            <div key={step.id} className={cn(
              "flex items-start",
              compact ? "flex-col items-center" : "flex-row gap-3"
            )}>
              {!compact && (
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                      isStepComplete && "bg-green-500 border-green-500 text-white",
                      isCurrentStep && !isStepFailed && "border-blue-500 bg-blue-500/10 text-blue-500",
                      isStepFailed && "border-red-500 bg-red-500/10 text-red-500",
                      isPending && "border-muted-foreground/30 text-muted-foreground/50"
                    )}
                  >
                    {isStepComplete ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrentStep && !isStepFailed ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  {index < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-8 transition-all",
                        isStepComplete ? "bg-green-500" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              )}
              
              {compact ? (
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      isStepComplete && "bg-green-500",
                      isCurrentStep && !isStepFailed && "bg-blue-500 animate-pulse",
                      isStepFailed && "bg-red-500",
                      isPending && "bg-muted-foreground/30"
                    )}
                  />
                  {index < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-6 h-0.5 mt-1.5 mb-1.5",
                        isStepComplete ? "bg-green-500" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              ) : (
                <div className="pb-6">
                  <p className={cn(
                    "text-sm font-medium",
                    isStepComplete && "text-green-500",
                    isCurrentStep && !isStepFailed && "text-blue-500",
                    isStepFailed && "text-red-500",
                    isPending && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {compact && (
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Init</span>
          <span>Package</span>
        </div>
      )}
    </div>
  );
}
