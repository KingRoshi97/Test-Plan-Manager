import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

interface AnalyticsErrorStateProps {
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function AnalyticsErrorState({ message = "Failed to load analytics data", onRetry, onBack }: AnalyticsErrorStateProps) {
  return (
    <div className="glass-panel-solid p-6 flex items-center gap-3 border border-[hsl(var(--status-failure)/0.3)]">
      <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-failure))] flex-shrink-0" />
      <p className="text-sm text-[hsl(var(--status-failure))] flex-1">{message}</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
