import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isClickable && "cursor-pointer hover:opacity-80",
                  !isClickable && "cursor-default"
                )}
                data-testid={`stepper-step-${step.id}`}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted && "bg-gradient-to-br from-[hsl(var(--axiom-amber))] via-[hsl(var(--axiom-orange))] to-[hsl(var(--axiom-warm))] border-transparent text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.5)]",
                    isCurrent && "border-primary border-[3px] bg-primary/20 text-primary shadow-[0_0_24px_6px_hsl(var(--primary)/0.6)]",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    (isCurrent || isCompleted) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 hidden sm:block">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all",
                      index < currentIndex ? "bg-gradient-to-r from-[hsl(var(--axiom-amber))] to-[hsl(var(--axiom-orange))]" : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
