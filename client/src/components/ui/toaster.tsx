import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md border p-3 shadow-md flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in-50",
            t.variant === "destructive" && "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
            t.variant === "success" && "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
            (!t.variant || t.variant === "default") && "border-border bg-card"
          )}
          data-testid="toast"
        >
          {t.variant === "destructive" && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
          {t.variant === "success" && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />}
          {(!t.variant || t.variant === "default") && <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium",
              t.variant === "destructive" && "text-red-800 dark:text-red-200",
              t.variant === "success" && "text-green-800 dark:text-green-200",
            )}>{t.title}</p>
            {t.description && (
              <p className={cn(
                "text-xs mt-1",
                t.variant === "destructive" && "text-red-700 dark:text-red-300",
                t.variant === "success" && "text-green-700 dark:text-green-300",
                (!t.variant || t.variant === "default") && "text-muted-foreground",
              )}>{t.description}</p>
            )}
          </div>
          <button onClick={() => dismiss(t.id)} className="shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
